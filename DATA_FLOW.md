# WebRTC Room — Data Flow

Обозначения:
- `→` Клиент → Сервер (COMMANDS /app/...)
- `←` Сервер → Клиент (TOPICS /topic/...)
- `⚙` Локальное действие (mediasoup, без сети)

---

## 1. Подключение

```
⚙  STOMP client.activate()
←  /topic/ — соединение установлено (onConnect)
→  /app/room.join        { roomId }
←  /topic/room.rtp-capabilities  { rtpCapabilities }
```

## 2. Инициализация Device

```
⚙  device.load({ routerRtpCapabilities })
→  /app/transport.create  { direction: 'send', sctpCapabilities }
→  /app/transport.create  { direction: 'recv', sctpCapabilities }
```

## 3. Создание транспортов

```
←  /topic/transport.send.created  { parameters }
⚙  device.createSendTransport(parameters)
⚙  sendTransport.on('connect', ...)   — ждёт первого produce
⚙  sendTransport.on('produce', ...)   — ждёт produce()

←  /topic/transport.recv.created  { parameters }
⚙  device.createRecvTransport(parameters)
⚙  recvTransport.on('connect', ...)   — ждёт первого consume
```

## 4. Produce (триггерится автоматически после createSendTransport)

```
⚙  getStream()                              — лениво, только здесь
⚙  sendTransport.produce({ track: videoTrack })
⚙  sendTransport.produce({ track: audioTrack })

  Каждый produce() триггерит события транспорта:

  [connect event]
  →  /app/transport.connect  { transportId, dtlsParameters }
  ←  /topic/transport.connected  { transportId }
  ⚙  connectCallback()         — mediasoup разблокирует transport

  [produce event]
  →  /app/producer.produce  { transportId, kind, rtpParameters, appData }
  ←  /topic/producer.produced  { producerId }
  ⚙  produceCallback({ id: producerId })   — mediasoup завершает produce
```

## 5. Новый участник в комнате

```
←  /topic/producer.new  { producerId, kind }

  Для каждого нового producer:

  →  /app/consumer.consume  { transportId, producerId, kind, rtpCapabilities }
  ←  /topic/consumer.consumed  { consumerId, producerId, kind, rtpParameters }

  [connect event — если recvTransport ещё не подключён]
  →  /app/transport.connect  { transportId, dtlsParameters }
  ←  /topic/transport.connected  { transportId }
  ⚙  connectCallback()

  ⚙  recvTransport.consume({ id, producerId, kind, rtpParameters })
  ⚙  new MediaStream([consumer.track])
  ⚙  setVideos(...)                        — трек появляется в UI

  →  /app/consumer.resume  { consumerId }  — сервер начинает слать медиа
```

## 6. Участник покидает комнату

```
←  /topic/room.participant.left  { participantId }
⚙  (обработка на усмотрение UI)
```

## 7. Отключение

```
⚙  subscriptions.forEach(sub => sub.unsubscribe())
→  /app/room.leave  { roomId }
⚙  client.deactivate()
```

---

## Слои и ответственность

```
room.tsx              — UI, refs, getStream фабрика
useRoom.ts            — оркестрация: STOMP lifecycle, подписки, join/leave
useMediasoup.ts       — device, транспорты, produce/consume, videos[]
subscribers/          — парсинг STOMP фреймов → типизированные колбэки
publishers/           — сериализация payload → STOMP publish
topics.ts             — /topic/... (Server → Client)
commands.ts           — /app/...   (Client → Server)
```
