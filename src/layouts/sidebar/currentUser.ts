/** Signed-in user. Placeholder until real auth exists. */
export const currentUser = {
  name: 'Kevin Smith',
};

export const userInitial = (name: string) => name.trim().charAt(0).toUpperCase();
