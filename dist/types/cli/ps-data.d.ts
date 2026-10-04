import { type DaemonBrokerClient } from "../launch/client.js";
import { type PsScope, type PsScopeReport, type PsTarget } from "@oh-my-pi/pi-tui-zh/apps/ps-data";
/** Hard SIGTERM->SIGKILL grace used by `kill`; effectively immediate. */
export declare const KILL_GRACE_MS = 100;
/** The single scope named by `target` (defaults to the current project). */
export declare function targetScope(target: PsTarget): Promise<PsScope>;
/** Every scope on this machine: hash-keyed project scopes plus global service scopes. */
export declare function discoverScopes(): Promise<PsScope[]>;
/**
 * Connect to a scope's broker. Undefined when the scope cannot be addressed
 * (Windows pipe names derive from the project dir, which may be unknown for
 * discovered scopes). The caller owns the returned client and must close it.
 */
export declare function scopeClient(scope: PsScope): Promise<DaemonBrokerClient | undefined>;
/**
 * Collect daemons for one scope. Live brokers are authoritative; dead scopes
 * fall back to persisted snapshots, downgrading non-detached "running" records
 * to exited (their broker took them down with it) and flagging detached
 * survivors as unsupervised.
 */
export declare function collectScope(scope: PsScope): Promise<PsScopeReport>;
/**
 * Collect the scopes selected by `all`/`target`: every scope with `all`; one
 * scope for an explicit `--dir`/`--global` target; otherwise the current
 * project plus the machine-global services (shared by all projects, e.g. the
 * text-prediction daemon) that have a live process — their exited history
 * only shows with `--all` or `--global`. Discovered scopes that are empty and
 * brokerless are hidden; the current project always shows.
 */
export declare function collectReports(all: boolean, target: PsTarget): Promise<PsScopeReport[]>;
