import {
  IDataObject,
  INodeExecutionData,
  INodeProperties,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import { MeterProvider, MetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

export class OpenTelemetryMetrics implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'OpenTelemetry Metrics',
    name: 'openTelemetryMetrics',
        icon: 'file:opentelemetry.svg',
    group: ['transform'],
    version: 1,
        description: 'Send metrics to an OTLP endpoint via OpenTelemetry',
    defaults: {
      name: 'OpenTelemetry Metrics',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
          {
            displayName: 'OTLP Metrics Endpoint',
            name: 'host',
            type: 'string',
            default: 'http://localhost:4318/v1/metrics',
            description: 'e.g., http://otel-collector:4318/v1/metrics',
          },
      {
        displayName: 'Service Name',
        name: 'serviceName',
        type: 'string',
        default: 'n8n-workflow',
      },
      {
        displayName: 'Resource Attributes',
        name: 'resourceAttributes',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        options: [
          {
            name: 'attributes',
            displayName: 'Attributes',
            values: [
              {
                displayName: 'Key',
                name: 'key',
                type: 'string',
                default: '',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Meter Name',
        name: 'meterName',
        type: 'string',
        default: 'n8n',
      },
      {
        displayName: 'Instrument Type',
        name: 'instrumentType',
        type: 'options',
        default: 'counter',
        options: [
          { name: 'Counter', value: 'counter' },
          { name: 'UpDownCounter', value: 'upDownCounter' },
          { name: 'Histogram', value: 'histogram' },
        ],
      },
      {
        displayName: 'Instrument Name',
        name: 'instrumentName',
        type: 'string',
        default: 'event_count',
      },
      {
        displayName: 'Value',
        name: 'value',
        type: 'number',
        default: 1,
      },
      {
        displayName: 'Attributes',
        name: 'attributes',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        options: [
          {
            name: 'attributes',
            displayName: 'Attributes',
            values: [
              {
                displayName: 'Key',
                name: 'key',
                type: 'string',
                default: '',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
              },
            ],
          },
        ],
      },
          {
            displayName: 'Headers',
            name: 'headers',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: true,
            },
            default: {},
            options: [
              {
                name: 'headers',
                displayName: 'Headers',
                values: [
                  {
                    displayName: 'Key',
                    name: 'key',
                    type: 'string',
                    default: '',
                  },
                  {
                    displayName: 'Value',
                    name: 'value',
                    type: 'string',
                    default: '',
                  },
                ],
              },
            ],
            description: 'HTTP headers for OTLP Exporter (e.g., Authorization)',
          },
          {
            displayName: 'Export Interval (ms)',
            name: 'exportIntervalMillis',
            type: 'number',
            default: 1000,
            description: 'Interval for exporting metrics (used by periodic reader)',
          },
    ] as INodeProperties[],
  };

  async execute(this: any): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
          const hostRaw = this.getNodeParameter('host', i) as string;
          let host = String(hostRaw).trim().replace(/^`+|`+$/g, '');
          if (!/\/v1\/metrics$/.test(host)) {
            host = host.replace(/\/$/, '') + '/v1/metrics';
          }
      const serviceName = this.getNodeParameter('serviceName', i) as string;
      const meterName = this.getNodeParameter('meterName', i) as string;
      const instrumentType = this.getNodeParameter('instrumentType', i) as string;
      const instrumentName = this.getNodeParameter('instrumentName', i) as string;
      const value = this.getNodeParameter('value', i) as number;

      const attrsCollection = this.getNodeParameter('attributes', i) as IDataObject;
      const resAttrsCollection = this.getNodeParameter('resourceAttributes', i) as IDataObject;
      const headersCollection = this.getNodeParameter('headers', i) as IDataObject;
      const exportIntervalMillis = this.getNodeParameter('exportIntervalMillis', i) as number;

      const attrs = Object.create(null) as Record<string, string>;
      const resAttrs = Object.create(null) as Record<string, string>;
      const headers = Object.create(null) as Record<string, string>;

      const attrsArray = (attrsCollection?.attributes as IDataObject[] | undefined) || [];
      const resAttrsArray = (resAttrsCollection?.attributes as IDataObject[] | undefined) || [];
      const headersArray = (headersCollection?.headers as IDataObject[] | undefined) || [];

      for (const entry of attrsArray) {
        const k = (entry.key as string) || '';
        const v = (entry.value as string) || '';
        if (k) attrs[k] = v;
      }
      for (const entry of resAttrsArray) {
        const k = (entry.key as string) || '';
        const v = (entry.value as string) || '';
        if (k) resAttrs[k] = v;
      }
      for (const entry of headersArray) {
        const k = (entry.key as string) || '';
        const v = (entry.value as string) || '';
        if (k) headers[k] = v;
      }

      const resource = new Resource({ 'service.name': serviceName, ...resAttrs });

      try {
            const exporter = new OTLPMetricExporter({ url: host, headers, timeoutMillis: 10000 });
        const provider = new MeterProvider({ resource });
        const reader: MetricReader = new (require('@opentelemetry/sdk-metrics').PeriodicExportingMetricReader)({
          exporter,
          exportIntervalMillis,
        });
        provider.addMetricReader(reader);

        const meter = provider.getMeter(meterName);

        switch (instrumentType) {
          case 'counter': {
            const counter = meter.createCounter(instrumentName);
            counter.add(value, attrs);
            break;
          }
          case 'upDownCounter': {
            const upDownCounter = meter.createUpDownCounter(instrumentName);
            upDownCounter.add(value, attrs);
            break;
          }
          case 'histogram': {
            const histogram = meter.createHistogram(instrumentName);
            histogram.record(value, attrs);
            break;
          }
              default:
                throw new NodeOperationError(this.getNode(), `Unsupported instrument type: ${instrumentType}`);
        }

            await (provider as any).forceFlush?.();
            await provider.shutdown();

        returnData.push({
          json: {
            status: 'ok',
                endpoint: host,
                serviceName,
                meterName,
                instrumentType,
                instrumentName,
                value,
                attributes: attrs,
                resourceAttributes: resAttrs,
                flushed: true,
              },
            });
      } catch (err) {
        throw new NodeOperationError(this.getNode(), (err as Error).message);
      }
    }

    return [returnData];
  }
}

