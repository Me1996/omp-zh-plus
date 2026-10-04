/**
 * OTLP provider registration and signal recording for telemetry export.
 *
 * Loaded on demand by `./telemetry-export` only when an `OTEL_*` endpoint is
 * configured — the OTel SDK + OTLP exporter graph costs ~100ms of module
 * evaluation, so it must stay out of default CLI startup.
 *
 * Only the `http/protobuf` transport is supported — an
 * `OTEL_EXPORTER_OTLP*_PROTOCOL` of `grpc` or `http/json` declines rather than
 * misrouting protobuf payloads. The exporter line is pinned to the 0.218/2.7
 * family validated under Bun; the 1.x OTLP line deadlocks when its
 * `req.on("close")` handler fires after a successful export.
 */
import type { AgentTelemetryConfig, CostEstimate, CostEstimatorContext } from "@oh-my-pi/pi-agent-core";
import type { TelemetryModelPricingResolver, TelemetrySignalConfig } from "./telemetry-export.js";
/** Whether {@link registerProviders} registered any real OTLP signal provider. */
export declare function isTelemetryExportEnabled(): boolean;
/**
 * Report the request's provider-computed `Usage.cost` as the telemetry cost.
 *
 * The resolver only decides whether the model's price is known, by registry
 * provider id and requested model id. The USD values are the ones the
 * provider already computed and persisted, never a recomputation.
 */
export declare function estimateProviderCost(context: CostEstimatorContext, modelPricingResolver: TelemetryModelPricingResolver): CostEstimate;
/**
 * Merge OTLP metrics/log hooks into an existing agent telemetry config.
 *
 * The caller still owns content-capture policy and custom attributes, and its
 * own `costEstimator` wins. Without one, `modelPricingResolver` installs
 * {@link estimateProviderCost}. Beyond that, this only appends host-level
 * metrics/log forwarding for the providers registered by
 * {@link registerProviders}.
 */
export declare function createTelemetryExportConfig(config: AgentTelemetryConfig | undefined, modelPricingResolver?: TelemetryModelPricingResolver): AgentTelemetryConfig | undefined;
/** Register global trace/log/meter providers for the enabled signals. */
export declare function registerProviders(signalConfig: TelemetrySignalConfig): Promise<void>;
/** Flush buffered spans, log records, and metrics across all registered providers. */
export declare function flushTelemetryExport(): Promise<void>;
