import supabase from '../../utils/supabase.js';

export const createSupabaseUser = async (email, password, userMetadata = {}) => {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: userMetadata
  });

  if (error) {
    console.error('Error creating Supabase user:', error);
    throw error;
  }

  return data.user;
};

export const updateSupabaseUser = async (userId, updates) => {
  const { data, error } = await supabase.auth.admin.updateUser(userId, {
    ...updates,
    email_confirm: true
  });

  if (error) {
    console.error('Error updating Supabase user:', error);
    throw error;
  }

  return data.user;
};

export const deleteSupabaseUser = async (userId) => {
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    console.error('Error deleting Supabase user:', error);
    throw error;
  }

  return true;
};

export const getSupabaseUser = async (userId) => {
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error) {
    console.error('Error getting Supabase user:', error);
    throw error;
  }

  return data.user;
};

export const listSupabaseUsers = async (options = {}) => {
  const { data, error } = await supabase.auth.admin.listUsers(options);

  if (error) {
    console.error('Error listing Supabase users:', error);
    throw error;
  }

  return data.users;
};
