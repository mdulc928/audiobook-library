import { SvelteSet } from 'svelte/reactivity';
import type { PermissionData, RoleData, UserData } from './User.schema';

export class Permission {
	id = $state<string>();
	name = $state<string>();
	description = $state<string>();

	constructor(data: PermissionData) {
		this.id = data.id ?? crypto.randomUUID();
		this.name = data.name;
		this.description = data.description;
	}

	toPOJO(): PermissionData {
		return {
			id: this.id,
			name: this.name,
			description: this.description
		};
	}

	toString() {
		return JSON.stringify(this.toPOJO());
	}
}

export class Role {
	id = $state<string>();
	name = $state<string>();
	description = $state<string>();
	permissions = $state<string[]>([]); // permission IDs that come with this role

	constructor(data: RoleData) {
		this.id = data.id ?? crypto.randomUUID();
		this.name = data.name;
		this.description = data.description;
		this.permissions = data.permissions ?? [];
	}

	/**
	 * Check if this role includes a specific permission
	 */
	hasPermission(permissionId: string): boolean {
		return this.permissions.includes(permissionId);
	}

	toPOJO(): RoleData {
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			permissions: this.permissions
		};
	}

	toString() {
		return JSON.stringify(this.toPOJO());
	}
}

export class User {
	id = $state<string>();
	email = $state<string>();
	displayName = $state<string>();
	avatar = $state<string>();
	roles = $state<string[]>([]); // role IDs
	permissions = $state<string[]>([]); // direct permission IDs

	/**
	 * All resolved Role instances for this user.
	 * Must be populated externally via `resolveRoles()`.
	 */
	#resolvedRoles = $state<Role[]>([]);

	/**
	 * Merged set of all permission IDs — from roles + directly assigned.
	 * Automatically updates when roles or direct permissions change.
	 */
	allPermissions = $derived.by(() => {
		const fromRoles = this.#resolvedRoles.flatMap((role) => role.permissions ?? []);
		const direct = this.permissions ?? [];
		return [...new SvelteSet([...fromRoles, ...direct])];
	});

	constructor(data: UserData) {
		this.id = data.id ?? crypto.randomUUID();
		this.email = data.email;
		this.displayName = data.displayName;
		this.avatar = data.avatar;
		this.roles = data.roles ?? [];
		this.permissions = data.permissions ?? [];
	}

	/**
	 * Populate the resolved Role instances so `allPermissions` can compute.
	 * Call this after fetching roles from the API.
	 */
	resolveRoles(allRoles: Role[]) {
		this.#resolvedRoles = allRoles.filter((role) => this.roles.includes(role.id ?? ''));
	}

	/**
	 * Check if this user has a specific role (by ID)
	 */
	hasRole(roleId: string): boolean {
		return this.roles.includes(roleId);
	}

	/**
	 * Check if this user has a specific permission — either directly or via a role.
	 * Requires `resolveRoles()` to have been called for role-based checks.
	 */
	hasPermission(permissionId: string): boolean {
		return this.allPermissions.includes(permissionId);
	}

	/**
	 * Add a role to the user
	 */
	addRole(roleId: string) {
		if (!this.roles.includes(roleId)) {
			this.roles = [...this.roles, roleId];
		}
	}

	/**
	 * Remove a role from the user
	 */
	removeRole(roleId: string) {
		this.roles = this.roles.filter((id) => id !== roleId);
	}

	/**
	 * Add a direct permission to the user
	 */
	addPermission(permissionId: string) {
		if (!this.permissions.includes(permissionId)) {
			this.permissions = [...this.permissions, permissionId];
		}
	}

	/**
	 * Remove a direct permission from the user
	 */
	removePermission(permissionId: string) {
		this.permissions = this.permissions.filter((id) => id !== permissionId);
	}

	toPOJO(): UserData {
		return {
			id: this.id,
			email: this.email,
			displayName: this.displayName,
			avatar: this.avatar,
			roles: this.roles,
			permissions: this.permissions
		};
	}

	toString() {
		return JSON.stringify(this.toPOJO());
	}
}
