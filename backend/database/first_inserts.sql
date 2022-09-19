INSERT
	IGNORE INTO permissions (
		permission_name,
		permission_description,
		permission_color
	)
VALUES
	('ABM_ROLES', 'Permite manejar roles.', 'orange'),
	(
		'ABM_USUARIOS',
		'Permite manejar usuarios.',
		'yellow'
	),
	(
		'ABM_LINEAS_DE_NEGOCIOS',
		'Permite manejar líneas de negocio.',
		'pink'
	),
	('ABM_APIS', 'Permite manejar apis.', 'grey'),
	(
		'ABM_VERSIONES',
		'Permite manejar versiones.',
		'blue'
	);

INSERT
	IGNORE INTO stages (stage_name, stage_color)
VALUES
	('default', 'blue');

INSERT
	IGNORE INTO roles (role_id, role_name)
VALUES
	(1, 'default');

INSERT 
	IGNORE INTO tags
		(tag_name)
	VALUES
		('dev'),
		('test'),
		('prod'),
		('default');

INSERT
	IGNORE INTO tag_accounts (tag_account, tag_account_name)
VALUES
	('default', 4)
	('external',1)
	('external',2)
	('external',3);