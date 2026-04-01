CREATE TABLE IF NOT EXISTS parking_spot (
  id        SERIAL PRIMARY KEY,
  row       VARCHAR(1)  NOT NULL,
  col       VARCHAR(2)  NOT NULL,
  is_electric BOOLEAN   NOT NULL DEFAULT false
);

INSERT INTO parking_spot (row, col, is_electric)
SELECT row, col, is_electric FROM (VALUES
  ('A', '01', true),  ('A', '02', true),  ('A', '03', true),  ('A', '04', true),  ('A', '05', true),
  ('A', '06', true),  ('A', '07', true),  ('A', '08', true),  ('A', '09', true),  ('A', '10', true),
  ('B', '01', false), ('B', '02', false), ('B', '03', false), ('B', '04', false), ('B', '05', false),
  ('B', '06', false), ('B', '07', false), ('B', '08', false), ('B', '09', false), ('B', '10', false),
  ('C', '01', false), ('C', '02', false), ('C', '03', false), ('C', '04', false), ('C', '05', false),
  ('C', '06', false), ('C', '07', false), ('C', '08', false), ('C', '09', false), ('C', '10', false),
  ('D', '01', false), ('D', '02', false), ('D', '03', false), ('D', '04', false), ('D', '05', false),
  ('D', '06', false), ('D', '07', false), ('D', '08', false), ('D', '09', false), ('D', '10', false),
  ('E', '01', false), ('E', '02', false), ('E', '03', false), ('E', '04', false), ('E', '05', false),
  ('E', '06', false), ('E', '07', false), ('E', '08', false), ('E', '09', false), ('E', '10', false),
  ('F', '01', true),  ('F', '02', true),  ('F', '03', true),  ('F', '04', true),  ('F', '05', true),
  ('F', '06', true),  ('F', '07', true),  ('F', '08', true),  ('F', '09', true),  ('F', '10', true)
) AS data(row, col, is_electric)
WHERE NOT EXISTS (SELECT 1 FROM parking_spot LIMIT 1);

INSERT INTO user (email, password, first_name, last_name, role)
SELECT email, password, first_name, last_name, role FROM (VALUES
  ('test@gmail.com', '$2a$12$fEGb3HfVXQcUOp5BXMWHlOTkedCLgwME1H6RRL4ec4wPTEYsaesYS', 'Test', 'User', 'employee')
) AS data(email, password, first_name, last_name, role)
WHERE NOT EXISTS (SELECT 1 FROM user LIMIT 1);