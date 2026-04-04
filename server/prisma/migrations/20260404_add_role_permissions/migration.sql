-- Add new role permissions
INSERT INTO "permission" ("key", "label", "description", "category") VALUES
  ('administrator', 'Administrator', 'Bypasses all permission checks. Grants full access.', 'General'),
  ('create_product', 'Create Product', 'Create new products in the marketplace. Users can manage their own products.', 'Products'),
  ('manage_product', 'Manage All Products', 'Approve, reject, and manage any product in the marketplace.', 'Products'),
  ('manage_student', 'Manage Students', 'Modify existing student accounts.', 'Users'),
  ('manage_teacher', 'Manage Teachers', 'Modify existing teacher accounts.', 'Users'),
  ('create_student', 'Create Student', 'Create new student accounts.', 'Users'),
  ('create_teacher', 'Create Teacher', 'Create new teacher accounts.', 'Users'),
  ('create_user', 'Create User', 'Create new user accounts of any type.', 'Users'),
  ('manage_user', 'Manage User', 'Modify any user account.', 'Users'),
  ('create_course', 'Create Course', 'Create new courses.', 'Courses'),
  ('manage_course', 'Manage Course', 'Edit and manage existing courses.', 'Courses'),
  ('create_role', 'Create Role', 'Create new roles.', 'Roles'),
  ('manage_role', 'Manage Role', 'Edit and delete roles.', 'Roles'),
  ('manage_institution', 'Manage Institution', 'Change college config like XP multiplier, rewards for assignment completion.', 'Institution'),
  ('create_event', 'Create Event', 'Create new events.', 'Events'),
  ('manage_event', 'Manage Event', 'Edit and manage existing events.', 'Events'),
  ('create_announcement', 'Create Announcement', 'Create new announcements.', 'Announcements'),
  ('manage_announcement', 'Manage Announcement', 'Edit and manage existing announcements.', 'Announcements'),
  ('manage_suggestions', 'Manage Suggestions', 'Review and manage user suggestions.', 'Suggestions'),
  ('manage_xp', 'Manage XP & Coins', 'Add or remove user XP and coins/money.', 'XP & Rewards')
ON CONFLICT ("key") DO NOTHING;
