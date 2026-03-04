import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Note {
    id: string;
    title: string;
    content: string;
    imageUrls: Array<string>;
    createdAt: bigint;
    updatedAt: bigint;
    pinned: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addImageToNote(noteId: string, imageUrl: string): Promise<Note>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createNote(title: string, content: string): Promise<Note>;
    deleteNote(id: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getNote(id: string): Promise<Note>;
    getNotes(): Promise<Array<Note>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeImageFromNote(noteId: string, imageUrl: string): Promise<Note>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchNotes(searchTerm: string): Promise<Array<Note>>;
    togglePin(id: string): Promise<Note>;
    updateNote(id: string, title: string, content: string): Promise<Note>;
}
