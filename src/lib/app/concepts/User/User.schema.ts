import { z } from 'zod';

// Schema for Permission
export const permissionSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	description: z.string().optional()
});

// Schema for Role
export const roleSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	description: z.string().optional(),
	permissions: z.array(z.string()).optional() // permission IDs that come with this role
});

// Schema for User
export const userSchema = z.object({
	id: z.string().optional(),
	email: z.string().email().optional(),
	displayName: z.string().optional(),
	avatar: z.string().optional(),
	roles: z.array(z.string()).optional(), // role IDs
	permissions: z.array(z.string()).optional() // direct permission IDs (beyond what roles provide)
});

// Schema for API responses
export const userResponseSchema = userSchema;
export const usersResponseSchema = z.array(userSchema);
export const rolesResponseSchema = z.array(roleSchema);
export const permissionsResponseSchema = z.array(permissionSchema);

// Type exports
export type PermissionData = z.infer<typeof permissionSchema>;
export type RoleData = z.infer<typeof roleSchema>;
export type UserData = z.infer<typeof userSchema>;
export type UserResponseData = z.infer<typeof userResponseSchema>;
export type UsersResponseData = z.infer<typeof usersResponseSchema>;
export type RolesResponseData = z.infer<typeof rolesResponseSchema>;
export type PermissionsResponseData = z.infer<typeof permissionsResponseSchema>;
