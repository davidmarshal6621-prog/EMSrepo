-- Demo workspace for local QA. All demo accounts use: Demo@123
BEGIN;

TRUNCATE TABLE punch_logs, payroll, leaves, leave_types, attendance, users, employees,
  devices, shifts, departments, branches, company_settings RESTART IDENTITY CASCADE;

INSERT INTO branches (name, address, city, phone)
VALUES ('Lahore Head Office', '18 Main Boulevard', 'Lahore', '+92 42 111 222 333');

INSERT INTO departments (name, branch_id)
VALUES
  ('Engineering', 1),
  ('People & Operations', 1),
  ('Finance', 1);

INSERT INTO shifts (name, start_time, end_time, grace_period_minutes, working_hours)
VALUES
  ('Morning Shift', '09:00', '18:00', 15, 8),
  ('Evening Shift', '14:00', '23:00', 15, 8);

INSERT INTO leave_types (name, max_days_per_year, is_paid, description)
VALUES
  ('Annual Leave', 20, true, 'Paid annual leave'),
  ('Sick Leave', 12, true, 'Medical leave'),
  ('Unpaid Leave', 30, false, 'Leave without salary');

INSERT INTO employees
  (employee_code, first_name, last_name, email, phone, cnic, designation,
   department_id, branch_id, shift_id, date_of_joining, basic_salary, allowances,
   enroll_number, status, nationality)
SELECT
  'EMP-' || lpad(n::text, 3, '0'),
  (ARRAY['Ayesha','Bilal','Hira','Hamza','Maham','Omar','Sana','Usman'])[n],
  (ARRAY['Khan','Ahmed','Raza','Malik','Iqbal','Sheikh','Farooq','Qureshi'])[n],
  lower((ARRAY['ayesha','bilal','hira','hamza','maham','omar','sana','usman'])[n]) || '@demo.pk',
  '+92 300 000 ' || lpad(n::text, 4, '0'),
  '35202-000000' || lpad(n::text, 1, '0') || '-0',
  (ARRAY['Senior Engineer','Software Engineer','HR Executive','Product Manager',
         'Accountant','Support Specialist','QA Engineer','Operations Officer'])[n],
  CASE WHEN n IN (1,2,7) THEN 1 WHEN n IN (3,4,6,8) THEN 2 ELSE 3 END,
  1,
  CASE WHEN n IN (4,8) THEN 2 ELSE 1 END,
  '2025-01-06',
  85000 + (n * 7500),
  10000 + (n * 500),
  'ENR-' || lpad(n::text, 3, '0'),
  'active',
  'Pakistani'
FROM generate_series(1, 8) AS g(n);

-- Admin, HR and eight employee logins.
INSERT INTO users (email, password_hash, temp_password, name, role, is_active, employee_id)
VALUES
  ('admin@demo.pk', '$2b$10$mu2UWeNZDExQl5C0VIk49eegSGCMJ2xT9nVi57303CO/Cb5iO0TG2', 'Demo@123', 'Demo Admin', 'admin', true, null),
  ('hr@demo.pk',    '$2b$10$mu2UWeNZDExQl5C0VIk49eegSGCMJ2xT9nVi57303CO/Cb5iO0TG2', 'Demo@123', 'Demo HR', 'hr', true, null);

INSERT INTO users (email, password_hash, temp_password, name, role, is_active, employee_id)
SELECT e.email, '$2b$10$mu2UWeNZDExQl5C0VIk49eegSGCMJ2xT9nVi57303CO/Cb5iO0TG2',
       'Demo@123', e.first_name || ' ' || e.last_name, 'employee', true, e.id
FROM employees e
ORDER BY e.id;

-- One month of realistic weekday attendance with a few late and leave records.
INSERT INTO attendance
  (employee_id, date, check_in, check_out, working_hours, status, is_late,
   is_early_out, source, notes, check_in_verify_type, check_out_verify_type)
SELECT
  e.id,
  d::date,
  d + interval '9 hours' + CASE WHEN extract(day from d)::int % 7 = 0 THEN interval '25 minutes' ELSE interval '0 minutes' END,
  d + interval '18 hours',
  CASE WHEN extract(day from d)::int % 11 = 0 THEN 7.25 ELSE 8.0 END,
  CASE WHEN extract(day from d)::int % 13 = 0 THEN 'on-leave'
       WHEN extract(day from d)::int % 7 = 0 THEN 'late' ELSE 'present' END,
  extract(day from d)::int % 7 = 0,
  false, 'biometric', 'Demo attendance record', 'fingerprint', 'fingerprint'
FROM employees e
CROSS JOIN generate_series('2026-07-01'::date, '2026-07-31'::date, '1 day') AS days(d)
WHERE extract(isodow from d) < 6;

INSERT INTO payroll
  (employee_id, month, year, basic_salary, allowances, late_deductions,
   leave_deductions, other_deductions, net_salary, present_days, absent_days,
   late_days, status)
SELECT e.id, 7, 2026, e.basic_salary, coalesce(e.allowances, 0),
       0, 0, 0, e.basic_salary + coalesce(e.allowances, 0),
       (SELECT count(*) FROM attendance a WHERE a.employee_id = e.id AND a.status IN ('present','late')),
       0,
       (SELECT count(*) FROM attendance a WHERE a.employee_id = e.id AND a.is_late),
       CASE WHEN e.id <= 3 THEN 'approved' ELSE 'draft' END
FROM employees e;

INSERT INTO company_settings (key, value) VALUES
  ('companyName', 'Demo Pakistan Workspaces'),
  ('currency', 'PKR'),
  ('currencySymbol', 'Rs.'),
  ('timezone', 'Asia/Karachi'),
  ('dateFormat', 'DD/MM/YYYY');

COMMIT;