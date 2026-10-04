import type { EffectiveExtensionRoots } from "../capability/types.js";
import type { AgentDefinition } from "./types.js";
/** Result of agent discovery */
export interface DiscoveryResult {
    agents: AgentDefinition[];
    projectAgentsDir: string | null;
    /** Agent directories searched, in precedence order (for "unknown agent" diagnostics). */
    searchedDirs?: string[];
}
/**
 * Discover agents from filesystem and merge with bundled agents.
 * Precedence (highest wins): project `.omp/agents`, user `.omp/agents`,
 * OMP extension-package agents from the effective `extensions` setting,
 * installed npm/link plugins, Claude marketplace plugin agents (project scope
 * before user), then bundled.
 * @param cwd - Current working directory for project agent discovery
 * @param home - Home directory for user and marketplace discovery
 * @param extensionRoots - Session-local extension roots (explicit + mode + configured)
 */
export declare function discoverAgents(cwd: string, home?: string, extensionRoots?: EffectiveExtensionRoots): Promise<DiscoveryResult>;
/**
 * Get an agent by name from discovered agents.
 */
export declare function getAgent(agents: AgentDefinition[], name: string): AgentDefinition | undefined;
