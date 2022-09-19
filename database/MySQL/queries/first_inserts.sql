INSERT INTO
	permissions (
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

INSERT INTO
	stages (stage_name, stage_color)
VALUES
	('default', 'grey');

INSERT INTO
	tag_accounts (tag_account, tag_account_name, tag_account_color)
VALUES
	('default', 'default', 'grey');

INSERT INTO
	roles (role_id, role_name, role_description, role_color)
VALUES
	(1, 'default', 'default', 'grey');