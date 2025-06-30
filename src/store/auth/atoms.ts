import { atom } from '@reatom/core';

export const accessTokenAtom = atom<string | null>(null, 'accessTokenAtom');

export const refreshTokenAtom = atom<string | null>(null, 'refreshTokenAtom');

export const authErrorAtom = atom<string | null>(null, 'authErrorAtom');

export const authRoleAtom = atom<string | null>(null, 'authRoleAtom');

export const isAuthAtom = atom<boolean>(false);

export const isAuthCheckingAtom = atom(false, 'isAuthCheckingAtom');
