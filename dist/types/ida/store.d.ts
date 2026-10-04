/** Number of leading bytes needed by {@link isExecutableHeader} (a full 64-byte DOS header for PE). */
export declare const EXECUTABLE_SNIFF_BYTES = 64;
/** Separator between a universal binary path and the slice to analyze (`<bin>:@<arch>`). */
export declare const SLICE_SEPARATOR = ":@";
/**
 * True when `header` starts with an ELF, thin Mach-O, or fat Mach-O magic, or holds a full DOS header
 * (`MZ`, ≥ 64 bytes, `e_lfanew` ≥ 64) so blobs that merely start with "MZ" are rejected.
 */
export declare function isExecutableHeader(header: Uint8Array): boolean;
/** One architecture slice of a fat (universal) Mach-O. */
export interface MachOSlice {
    /** lipo-style name (`x86_64`, `arm64e`); subtypes lipo cannot name render as `<family>.<subtype>`. */
    arch: string;
    cpuType: number;
    /** Byte offset of the thin Mach-O inside the fat file. */
    offset: number;
    size: number;
}
/** The slice of a universal binary a database was built from, plus its siblings. */
export interface FatSelection {
    slice: MachOSlice;
    slices: MachOSlice[];
}
/**
 * Parse the slice table of a fat Mach-O (`fat_arch` or `fat_arch_64`) from its leading bytes.
 * Returns null for anything that is not a fat Mach-O, including Java class files and headers
 * truncated before the end of the table.
 */
export declare function parseFatSlices(header: Uint8Array): MachOSlice[] | null;
/** Slice table of a fat Mach-O on disk; null when the file is not one. */
export declare function readFatSlices(absPath: string): Promise<MachOSlice[] | null>;
/**
 * Pick the slice named `arch`, or by default the first slice matching the host CPU (falling back to the first slice).
 * Throws a ToolError listing the available slices when `arch` names none of them.
 */
export declare function selectSlice(slices: MachOSlice[], arch?: string): MachOSlice;
/**
 * Split an explicit slice suffix off a binary reference: `/usr/bin/yes:@x86_64` → `{ path: "/usr/bin/yes", arch: "x86_64" }`.
 * References without `:@` come back unchanged.
 */
export declare function splitSliceRef(ref: string): {
    path: string;
    arch?: string;
};
/** True when `p` has an IDA database extension (`.i64`/`.idb`, case-insensitive). */
export declare function isIdaDatabasePath(p: string): boolean;
/** Sniff the file header; false on any I/O error. */
export declare function isExecutableFile(absPath: string): Promise<boolean>;
/** Where an IDB for a given source lives and how to open it. */
export interface IdbLocation {
    /** Registry key: `<sha16>-<name>` for store DBs, `<name>-<pathsha8>` for in-place DBs. */
    id: string;
    /** Directory holding the IDB (store dir, or the user's directory for in-place). */
    dir: string;
    /** Absolute path the user asked for (binary or `.i64`/`.idb`). */
    sourcePath: string;
    /** `store` = managed under the agent dir; `inplace` = user's own `.i64`/`.idb`. */
    kind: "store" | "inplace";
    /** Path passed to the worker's `open`; provisional for store DBs until {@link prepareStoreDir}. */
    openPath: string;
    /** Whether the worker must create a new database; provisional for store DBs until {@link prepareStoreDir}. */
    isNew: boolean;
    /** Path handed to `acquireFileLock` (lock file is `${lockTarget}.lock`). */
    lockTarget: string;
    /** Set for universal binaries: the store IDB is built from `fat.slice` alone. */
    fat?: FatSelection;
}
/** Reference `read` and `ida db=` resolve back to a database: the source path plus `:@<arch>` for a universal binary slice. */
export declare function idbRef(loc: Pick<IdbLocation, "sourcePath" | "fat">): string;
/** Options for {@link locateIdb}. */
export interface LocateIdbOptions {
    /** Slice of a universal binary to analyze; defaults to the host architecture. Rejected for thin binaries and IDBs. */
    arch?: string;
}
/** Replace characters outside `[A-Za-z0-9._-]` with `_` and cap at 64 chars. */
export declare function sanitizeIdbName(name: string): string;
/**
 * Compute the IDB location for a binary (content-addressed store, one per slice of a universal binary)
 * or an existing `.i64`/`.idb` (in place).
 * Throws a ToolError when `arch` is given for a thin binary or IDB, or names no slice.
 */
export declare function locateIdb(sourcePath: string, options?: LocateIdbOptions): Promise<IdbLocation>;
/**
 * Validate an in-place location (refuses when IDA has it unpacked) or stage a store binary and settle `loc.openPath`/`loc.isNew`.
 * Call only while holding the lock on `loc.lockTarget` and only when the DB is not already open in this process.
 */
export declare function prepareStoreDir(loc: IdbLocation): Promise<void>;
