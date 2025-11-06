/**
 * Mock implementation of the Obsidian API for testing
 * This provides stub implementations of core Obsidian classes and interfaces
 */

import { vi } from 'vitest';

// Mock App class
export class App {
	vault: Vault;
	workspace: Workspace;
	metadataCache: MetadataCache;

	constructor() {
		this.vault = new Vault();
		this.workspace = new Workspace();
		this.metadataCache = new MetadataCache();
	}
}

// Mock Vault class
export class Vault {
	adapter = {
		read: vi.fn(),
		write: vi.fn(),
		exists: vi.fn(),
		remove: vi.fn(),
		list: vi.fn(),
	};

	read = vi.fn();
	modify = vi.fn();
	create = vi.fn();
	delete = vi.fn();
	rename = vi.fn();
	getAbstractFileByPath = vi.fn();
	getFiles = vi.fn(() => []);
}

// Mock Workspace class
export class Workspace {
	on = vi.fn();
	off = vi.fn();
	trigger = vi.fn();
	getActiveFile = vi.fn();
	getLeaf = vi.fn();
	activeLeaf = null;
}

// Mock MetadataCache class
export class MetadataCache {
	on = vi.fn();
	off = vi.fn();
	getFileCache = vi.fn();
	getCache = vi.fn();
}

// Mock Plugin class
export class Plugin {
	app: App;
	manifest: PluginManifest;

	private commands: Map<string, Command> = new Map();
	private events: Array<{ event: string; callback: Function }> = [];

	constructor(app: App, manifest: PluginManifest) {
		this.app = app;
		this.manifest = manifest;
	}

	addCommand(command: Command) {
		this.commands.set(command.id, command);
		return command;
	}

	registerEvent(eventRef: any) {
		// Mock event registration
		return eventRef;
	}

	registerDomEvent(target: EventTarget, event: string, callback: Function) {
		// Mock DOM event registration
	}

	registerInterval(intervalId: number) {
		// Mock interval registration
		return intervalId;
	}

	loadData = vi.fn(async () => ({}));
	saveData = vi.fn(async () => {});

	addRibbonIcon(icon: string, title: string, callback: () => void) {
		return {
			remove: vi.fn(),
		};
	}

	addStatusBarItem() {
		const el = document.createElement('div');
		return el;
	}

	addSettingTab(settingTab: any) {
		// Mock setting tab registration
	}
}

// Mock PluginManifest interface
export interface PluginManifest {
	id: string;
	name: string;
	version: string;
	minAppVersion: string;
	description: string;
	author: string;
	authorUrl?: string;
	isDesktopOnly?: boolean;
}

// Mock Command interface
export interface Command {
	id: string;
	name: string;
	callback?: () => void;
	checkCallback?: (checking: boolean) => boolean | void;
	editorCallback?: (editor: any, view: any) => void;
	editorCheckCallback?: (checking: boolean, editor: any, view: any) => boolean | void;
	hotkeys?: Hotkey[];
}

// Mock Hotkey interface
export interface Hotkey {
	modifiers: Modifier[];
	key: string;
}

export type Modifier = 'Mod' | 'Ctrl' | 'Meta' | 'Shift' | 'Alt';

// Mock Notice class
export class Notice {
	message: string;
	timeout: number;

	constructor(message: string, timeout?: number) {
		this.message = message;
		this.timeout = timeout ?? 5000;
	}

	setMessage(message: string) {
		this.message = message;
	}

	hide() {
		// Mock hide
	}
}

// Mock TFile class
export class TFile {
	path: string;
	name: string;
	basename: string;
	extension: string;

	constructor(path: string) {
		this.path = path;
		const parts = path.split('/');
		this.name = parts[parts.length - 1];
		const nameParts = this.name.split('.');
		this.extension = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
		this.basename = nameParts.slice(0, -1).join('.');
	}
}

// Mock TFolder class
export class TFolder {
	path: string;
	name: string;
	children: Array<TFile | TFolder> = [];

	constructor(path: string) {
		this.path = path;
		const parts = path.split('/');
		this.name = parts[parts.length - 1];
	}
}

// Mock PluginSettingTab class
export class PluginSettingTab {
	app: App;
	plugin: Plugin;
	containerEl: HTMLElement;

	constructor(app: App, plugin: Plugin) {
		this.app = app;
		this.plugin = plugin;
		this.containerEl = document.createElement('div');
	}

	display(): void {
		// Override in subclass
	}

	hide(): void {
		// Override in subclass
	}
}

// Mock Setting class
export class Setting {
	settingEl: HTMLElement;

	constructor(containerEl: HTMLElement) {
		this.settingEl = document.createElement('div');
		containerEl.appendChild(this.settingEl);
	}

	setName(name: string): this {
		return this;
	}

	setDesc(desc: string): this {
		return this;
	}

	addText(cb: (text: any) => void): this {
		const text = {
			setValue: vi.fn().mockReturnThis(),
			setPlaceholder: vi.fn().mockReturnThis(),
			onChange: vi.fn().mockReturnThis(),
		};
		cb(text);
		return this;
	}

	addToggle(cb: (toggle: any) => void): this {
		const toggle = {
			setValue: vi.fn().mockReturnThis(),
			onChange: vi.fn().mockReturnThis(),
		};
		cb(toggle);
		return this;
	}

	addButton(cb: (button: any) => void): this {
		const button = {
			setButtonText: vi.fn().mockReturnThis(),
			onClick: vi.fn().mockReturnThis(),
			setCta: vi.fn().mockReturnThis(),
		};
		cb(button);
		return this;
	}
}

// Export other commonly used types
export const normalizePath = (path: string): string => {
	return path.replace(/\\/g, '/');
};

export const moment = {
	unix: vi.fn((timestamp: number) => ({
		format: vi.fn(() => new Date(timestamp * 1000).toISOString()),
	})),
};
