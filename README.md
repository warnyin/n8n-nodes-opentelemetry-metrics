![OpenTelemetry Metrics for n8n](https://raw.githubusercontent.com/warnyin/n8n-nodes-opentelemetry-metrics/main/assets/banner.svg)

# OpenTelemetry Metrics for n8n

Send metrics from n8n to an OTLP endpoint using OpenTelemetry. Supports Counter, UpDownCounter, and Histogram instruments with resource and metric attributes.

## Badges

![npm version](https://img.shields.io/npm/v/%40warnyin%2Fn8n-nodes-opentelemetry-metrics)
![license](https://img.shields.io/npm/l/%40warnyin%2Fn8n-nodes-opentelemetry-metrics)
![GitHub stars](https://img.shields.io/github/stars/warnyin/n8n-nodes-opentelemetry-metrics)

## Install

```bash
npm install @warnyin/n8n-nodes-opentelemetry-metrics
```

Restart n8n and enable Community Nodes. The node will be available to add in your workflow.

## Usage

- Set `OTLP Metrics Endpoint`, e.g. `http://collector:4318/v1/metrics`
- Set `Service Name` (used as resource attribute `service.name`)
- Choose `Instrument Type` (Counter, UpDownCounter, Histogram)
- Provide `Instrument Name` and metric `Value`
- Add metric `Attributes` (key/value)
- Add `Headers` for the OTLP HTTP exporter (e.g., `Authorization`)
- Optionally adjust `Export Interval (ms)`

## Example

- Instrument Type: Counter
- Instrument Name: `event_count`
- Value: `1`
- Attributes: `{ source: "n8n", workflow: "my-flow" }`

## Configuration Options

- `host`: OTLP HTTP endpoint (default: `http://localhost:4318/v1/metrics`)
- `serviceName`: Resource attribute `service.name`
- `resourceAttributes`: Additional resource attributes
- `meterName`: Meter name (default: `n8n`)
- `instrumentType`: `counter | upDownCounter | histogram`
- `instrumentName`: Metric instrument name
- `value`: Numeric value to add/record
- `attributes`: Key/value metric attributes
- `headers`: HTTP headers for OTLP exporter (e.g., `Authorization: Bearer ...`)
- `exportIntervalMillis`: Periodic export interval in milliseconds

## Development

- Build: `npm run build`
- Local package tarball: `npm pack`

## Contributing

PRs and issues are welcome. Please open an issue for bugs or feature requests.

## License

MIT License. See `LICENSE` file for details.
