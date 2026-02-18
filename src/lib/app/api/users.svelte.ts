import { User, Role, Permission } from '$lib/app/concepts/User/User.svelte';
import {
	userResponseSchema,
	rolesResponseSchema,
	permissionsResponseSchema
} from '$lib/app/concepts/User/User.schema';
import { resolve } from '$app/paths';
import type { QueryState } from './query';

// ─── Query States ────────────────────────────────────────────────

const userQueryState = $state<QueryState<User | undefined>>({
	data: undefined,
	isPending: false,
	isError: false,
	lastUpdated: 0,
	staleTime: 60 * 60 * 1000 // 1 hour
});

const rolesQueryState = $state<QueryState<Role[]>>({
	data: [],
	isPending: false,
	isError: false,
	lastUpdated: 0,
	staleTime: 60 * 60 * 1000
});

const permissionsQueryState = $state<QueryState<Permission[]>>({
	data: [],
	isPending: false,
	isError: false,
	lastUpdated: 0,
	staleTime: 60 * 60 * 1000
});

export type UserQueryState = typeof userQueryState;
export type RolesQueryState = typeof rolesQueryState;
export type PermissionsQueryState = typeof permissionsQueryState;

// ─── User API ────────────────────────────────────────────────────

export async function getUser(force = false): Promise<UserQueryState> {
	if (!force && userQueryState.isPending) {
		return userQueryState;
	}
	const isStale = Date.now() - userQueryState.lastUpdated > userQueryState.staleTime;
	if (!force && !isStale && userQueryState.data) {
		return userQueryState;
	}

	userQueryState.isPending = true;
	const response = await fetch(resolve('/api/users/me'));
	if (!response.ok) {
		userQueryState.isError = true;
		userQueryState.isPending = false;
		throw new Error('Failed to fetch user');
	}

	const data = await response.json();
	const validatedData = userResponseSchema.parse(data);
	userQueryState.data = new User(validatedData);
	userQueryState.isPending = false;
	userQueryState.isError = false;
	userQueryState.lastUpdated = Date.now();

	return userQueryState;
}

export async function updateUser(user: User) {
	const response = await fetch(resolve(`/api/users/${user.id}`), {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: user.toString()
	});

	if (!response.ok) {
		throw new Error('Failed to update user');
	}

	const data = await response.json();
	const validated = userResponseSchema.parse(data);

	// Invalidate cache
	userQueryState.lastUpdated = 0;

	return validated;
}

// ─── Roles API ───────────────────────────────────────────────────

export async function getRoles(force = false): Promise<RolesQueryState> {
	if (!force && rolesQueryState.isPending) {
		return rolesQueryState;
	}
	const isStale = Date.now() - rolesQueryState.lastUpdated > rolesQueryState.staleTime;
	if (!force && !isStale && (rolesQueryState.data?.length ?? 0) > 0) {
		return rolesQueryState;
	}

	rolesQueryState.isPending = true;
	const response = await fetch(resolve('/api/roles'));
	if (!response.ok) {
		rolesQueryState.isError = true;
		rolesQueryState.isPending = false;
		throw new Error('Failed to fetch roles');
	}

	const data = await response.json();
	const validatedData = rolesResponseSchema.parse(data);
	rolesQueryState.data = validatedData.map((d) => new Role(d));
	rolesQueryState.isPending = false;
	rolesQueryState.isError = false;
	rolesQueryState.lastUpdated = Date.now();

	return rolesQueryState;
}

export async function createRole(role: Role) {
	const response = await fetch(resolve('/api/roles'), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: role.toString()
	});

	if (!response.ok) {
		throw new Error('Failed to create role');
	}

	const data = await response.json();
	rolesQueryState.lastUpdated = 0;
	return data;
}

export async function updateRole(role: Role) {
	const response = await fetch(resolve(`/api/roles/${role.id}`), {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: role.toString()
	});

	if (!response.ok) {
		throw new Error('Failed to update role');
	}

	const data = await response.json();
	rolesQueryState.lastUpdated = 0;
	return data;
}

export async function deleteRole(id: string) {
	const response = await fetch(resolve(`/api/roles/${id}`), {
		method: 'DELETE'
	});

	if (!response.ok) {
		throw new Error('Failed to delete role');
	}

	rolesQueryState.lastUpdated = 0;
	return true;
}

// ─── Permissions API ─────────────────────────────────────────────

export async function getPermissions(force = false): Promise<PermissionsQueryState> {
	if (!force && permissionsQueryState.isPending) {
		return permissionsQueryState;
	}
	const isStale = Date.now() - permissionsQueryState.lastUpdated > permissionsQueryState.staleTime;
	if (!force && !isStale && (permissionsQueryState.data?.length ?? 0) > 0) {
		return permissionsQueryState;
	}

	permissionsQueryState.isPending = true;
	const response = await fetch(resolve('/api/permissions'));
	if (!response.ok) {
		permissionsQueryState.isError = true;
		permissionsQueryState.isPending = false;
		throw new Error('Failed to fetch permissions');
	}

	const data = await response.json();
	const validatedData = permissionsResponseSchema.parse(data);
	permissionsQueryState.data = validatedData.map((d) => new Permission(d));
	permissionsQueryState.isPending = false;
	permissionsQueryState.isError = false;
	permissionsQueryState.lastUpdated = Date.now();

	return permissionsQueryState;
}

export async function createPermission(permission: Permission) {
	const response = await fetch(resolve('/api/permissions'), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: permission.toString()
	});

	if (!response.ok) {
		throw new Error('Failed to create permission');
	}

	const data = await response.json();
	permissionsQueryState.lastUpdated = 0;
	return data;
}

export async function deletePermission(id: string) {
	const response = await fetch(resolve(`/api/permissions/${id}`), {
		method: 'DELETE'
	});

	if (!response.ok) {
		throw new Error('Failed to delete permission');
	}

	permissionsQueryState.lastUpdated = 0;
	return true;
}
