![OpenTelemetry Metrics for n8n](https://raw.githubusercontent.com/warnyin/n8n-nodes-opentelemetry-metrics/main/assets/banner.svg)

# n8n-nodes-opentelemetry-metrics

ส่ง metrics จาก n8n ไปยัง OTLP endpoint ผ่าน OpenTelemetry.

## การติดตั้ง

```bash
npm install @warnyin/n8n-nodes-opentelemetry-metrics
```

จากนั้นรีสตาร์ท n8n และเปิดใช้งาน Community Nodes เพื่อเพิ่ม node นี้ใน workflow ได้ทันที

## การใช้งาน

- ตั้งค่า `OTLP Metrics Endpoint` เช่น `http://collector:4318/v1/metrics`
- ตั้งค่า `Service Name` เพื่อเป็น resource attribute `service.name`
- เลือก `Instrument Type` (Counter, UpDownCounter, Histogram)
- ตั้งชื่อ `Instrument Name` และค่า `Value`
- ใส่ `Attributes` (key/value) เพิ่มเติมสำหรับ metrics
- ใส่ `Headers` (เช่น Authorization) สำหรับ OTLP HTTP Exporter
- ปรับ `Export Interval (ms)` หากต้องการ

## ตัวอย่างการส่ง Counter

- Instrument Type: Counter
- Instrument Name: `event_count`
- Value: `1`
- Attributes: `{ source: "n8n", workflow: "my-flow" }`

## License

MIT
