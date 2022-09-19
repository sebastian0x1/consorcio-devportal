CREATE TABLE IF NOT EXISTS stages (
  stage_id INT(11) NOT NULL AUTO_INCREMENT,
  stage_name VARCHAR(50) NOT NULL,
  stage_color VARCHAR(10) NOT NULL DEFAULT 'grey',
  stage_active BOOLEAN DEFAULT TRUE,
  stage_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  stage_updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (stage_id),
  UNIQUE KEY `stages_unique` (stage_name)
);

CREATE TABLE IF NOT EXISTS tags (
  tag_id INT(11) NOT NULL AUTO_INCREMENT,
  tag_name VARCHAR(50) NOT NULL,
  tag_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  tag_updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (tag_id),
  UNIQUE KEY `unique` (tag_name)
);

CREATE TABLE IF NOT EXISTS tag_accounts (
  tag_account_id INT(11) NOT NULL AUTO_INCREMENT,
  tag_account VARCHAR(255) NOT NULL,
  tag_account_name INT(11) NOT NULL,
  tag_account_color VARCHAR(10) NOT NULL DEFAULT 'grey',
  tag_account_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  tag_account_updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_tag_accounts_1` FOREIGN KEY (`tag_account_name`) REFERENCES `tags` (`tag_id`),
  PRIMARY KEY (tag_account_id),
  UNIQUE KEY `tag_accounts_unique` (tag_account,tag_account_name)
);

CREATE TABLE IF NOT EXISTS apis (
  api_id INT(11) NOT NULL AUTO_INCREMENT,
  api_apiid VARCHAR(50) NOT NULL,
  api_name VARCHAR(50) NOT NULL,
  api_color VARCHAR(10) NOT NULL DEFAULT 'grey',
  api_is_external BOOLEAN DEFAULT FALSE,
  api_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  api_updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (api_id),
  UNIQUE KEY `apis_unique` (api_apiid)
);


CREATE TABLE IF NOT EXISTS permissions (
  permission_id INT(11) NOT NULL AUTO_INCREMENT,
  permission_name VARCHAR(50) NOT NULL,
  permission_description TEXT DEFAULT NULL,
  permission_color VARCHAR(10) NOT NULL DEFAULT 'grey',
  permission_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (permission_id),
  UNIQUE KEY `permissions_unique` (permission_name)
);


CREATE TABLE IF NOT EXISTS business_lines (
  business_line_id INT(11) NOT NULL AUTO_INCREMENT,
  business_line_name VARCHAR(50) NOT NULL,
  business_line_color VARCHAR(10) NOT NULL DEFAULT 'grey',
  business_line_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  business_line_updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (business_line_id),
  UNIQUE KEY `business_lines_unique` (business_line_name)
);


CREATE TABLE IF NOT EXISTS roles (
  role_id INT(11) NOT NULL AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL,
  role_description TEXT NULL,
  role_color VARCHAR(10) NOT NULL DEFAULT 'grey',
  role_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  role_updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id),
  UNIQUE KEY `roles_unique` (role_name)
);

CREATE TABLE IF NOT EXISTS apis_stages (
  apis_stages_id INT(11) NOT NULL AUTO_INCREMENT,
  apis_stages_api_id INT(11) DEFAULT NULL,
  apis_stages_stage_id INT(11) DEFAULT NULL,
  apis_stages_api_hash VARCHAR(64) DEFAULT NULL,
  apis_stages_api_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  apis_stages_api_updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (apis_stages_id),
  UNIQUE KEY `apis_stages_unique` (apis_stages_api_id, apis_stages_stage_id),
  CONSTRAINT `fk_apis_stages_1` FOREIGN KEY (`apis_stages_api_id`) REFERENCES `apis` (`api_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_apis_stages_2` FOREIGN KEY (`apis_stages_stage_id`) REFERENCES `stages` (`stage_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS apis_tag_accounts (
  apis_tag_accounts_id INT(11) NOT NULL AUTO_INCREMENT,
  apis_tag_accounts_tag_account_id INT(11) DEFAULT NULL,
  apis_tag_accounts_api_id INT(11) DEFAULT NULL,
  PRIMARY KEY (apis_tag_accounts_id),
  UNIQUE KEY `apis_tag_accounts_unique` (apis_tag_accounts_tag_account_id, apis_tag_accounts_api_id),
  CONSTRAINT `fk_apis_tag_accounts_1` FOREIGN KEY (`apis_tag_accounts_tag_account_id`) REFERENCES `tag_accounts` (`tag_account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_apis_tag_accounts_2` FOREIGN KEY (`apis_tag_accounts_api_id`) REFERENCES `apis` (`api_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS business_lines_apis (
  business_lines_apis_id INT(11) NOT NULL AUTO_INCREMENT,
  business_lines_apis_api_id INT(11) DEFAULT NULL,
  business_lines_apis_business_line_id INT(11) DEFAULT NULL,
  PRIMARY KEY (business_lines_apis_id),
  UNIQUE KEY `business_lines_apis_unique` (business_lines_apis_api_id, business_lines_apis_business_line_id),
  CONSTRAINT `fk_business_lines_apis_1` FOREIGN KEY (`business_lines_apis_api_id`) REFERENCES `apis` (`api_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_business_lines_apis_2` FOREIGN KEY (`business_lines_apis_business_line_id`) REFERENCES `business_lines` (`business_line_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS business_lines_tag_accounts (
  business_lines_tag_accounts_id INT(11) NOT NULL AUTO_INCREMENT,
  business_lines_tag_accounts_tag_account_id INT(11) DEFAULT NULL,
  business_lines_tag_accounts_business_line_id INT(11) DEFAULT NULL,
  PRIMARY KEY (business_lines_tag_accounts_id),
  UNIQUE KEY `business_lines_tag_accounts_unique` (business_lines_tag_accounts_tag_account_id, business_lines_tag_accounts_business_line_id),
  CONSTRAINT `fk_business_lines_tag_accounts_1` FOREIGN KEY (`business_lines_tag_accounts_tag_account_id`) REFERENCES `tag_accounts` (`tag_account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_business_lines_tag_accounts_2` FOREIGN KEY (`business_lines_tag_accounts_business_line_id`) REFERENCES `business_lines` (`business_line_id`) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE IF NOT EXISTS roles_business_lines (
  roles_business_lines_id INT(11) NOT NULL AUTO_INCREMENT,
  roles_business_lines_business_line_id INT(11) DEFAULT NULL,
  roles_business_lines_role_id INT(11) DEFAULT NULL,
  PRIMARY KEY (roles_business_lines_id),
  UNIQUE KEY `roles_business_lines_unique` (roles_business_lines_business_line_id, roles_business_lines_role_id),
  CONSTRAINT `fk_roles_business_lines_1` FOREIGN KEY (`roles_business_lines_business_line_id`) REFERENCES `business_lines` (`business_line_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_roles_business_lines_2` FOREIGN KEY (`roles_business_lines_role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE IF NOT EXISTS roles_permissions (
  roles_permissions_id INT(11) NOT NULL AUTO_INCREMENT,
  roles_permissions_permission_id INT(11) DEFAULT NULL,
  roles_permissions_role_id INT(11) DEFAULT NULL,
  PRIMARY KEY (roles_permissions_id),
  UNIQUE KEY `roles_permissions_unique` (roles_permissions_permission_id, roles_permissions_role_id),
  CONSTRAINT `fk_roles_permissions_1` FOREIGN KEY (`roles_permissions_permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_roles_permissions_2` FOREIGN KEY (`roles_permissions_role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE IF NOT EXISTS users (
  user_id INT(11) NOT NULL AUTO_INCREMENT,
  user_role_id INT(11) DEFAULT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_email VARCHAR(100) NOT NULL,
  user_id_cognito VARCHAR(100) NOT NULL,
  user_api_key VARCHAR(100) NOT NULL,
  user_active BOOLEAN DEFAULT TRUE,
  user_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  user_sub_cognito VARCHAR(100),
  user_ad BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id),
  UNIQUE KEY `users_unique` (user_email),
  CONSTRAINT `fk_users_1` FOREIGN KEY (`user_role_id`) REFERENCES `roles` (`role_id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS realms (
  realm_id INT(11) NOT NULL AUTO_INCREMENT,
  realm_name VARCHAR(50) NOT NULL,
  realm_stage INT(11) NOT NULL,
  realm_endpoint VARCHAR(200) NOT NULL,
  realm_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  realm_updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (realm_id),
  UNIQUE KEY `realms_unique` (realm_endpoint),
  CONSTRAINT `fk_realm_stage` FOREIGN KEY (`realm_stage`) REFERENCES `stages` (`stage_id`) ON DELETE CASCADE ON UPDATE CASCADE
);