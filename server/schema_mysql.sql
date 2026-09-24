-- =======================================================
-- CLASS WEB: SRM AP CSE SECTION D DATABASE SCHEMA
-- MySQL / MariaDB Database Dump
-- Class Representative: AVIGAYAN JANA (AP26110090265)
-- Section: Cyber Security - D (CSE Sec-D)
-- =======================================================

CREATE DATABASE IF NOT EXISTS class_web_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE class_web_db;

-- 1. Portal Configuration Table
CREATE TABLE IF NOT EXISTS portal_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_email VARCHAR(255) NOT NULL DEFAULT 'cr.csed@srmap.edu.in',
    admin_name VARCHAR(255) NOT NULL DEFAULT 'CYBEX D - Class Representative',
    section_name VARCHAR(255) NOT NULL DEFAULT 'CYBEX D (CSE Sec-D)',
    batch_year VARCHAR(100) NOT NULL DEFAULT '2024 - 2028',
    academic_year VARCHAR(100) NOT NULL DEFAULT 'Semester I / II',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO portal_config (admin_email, admin_name, section_name, batch_year, academic_year)
VALUES ('cr.csed@srmap.edu.in', 'CYBEX D - Class Representative', 'CYBEX D (CSE Sec-D)', '2024 - 2028', 'Semester I / II')
ON DUPLICATE KEY UPDATE admin_email=admin_email;

-- 2. Students Table (58 Enrolled Students)
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    section VARCHAR(10) NOT NULL DEFAULT 'D',
    batch VARCHAR(50) NOT NULL DEFAULT '2024-2028',
    role VARCHAR(50) NOT NULL DEFAULT 'Student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Timetable Slots Table
CREATE TABLE IF NOT EXISTS timetable_slots (
    id VARCHAR(100) PRIMARY KEY,
    day VARCHAR(20) NOT NULL,
    period VARCHAR(10) NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    faculty VARCHAR(255) NOT NULL,
    room VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Lecture',
    color VARCHAR(50) NOT NULL DEFAULT 'blue',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    priority VARCHAR(50) NOT NULL DEFAULT 'Normal',
    is_pinned TINYINT(1) DEFAULT 0,
    author_name VARCHAR(255) DEFAULT 'CR / Class Admin',
    author_email VARCHAR(255) DEFAULT 'cr.csed@srmap.edu.in',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Feedback / Grievances Table
CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(100) PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_roll VARCHAR(50),
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'New',
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    is_anonymous TINYINT(1) DEFAULT 0,
    cr_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Course Materials Table
CREATE TABLE IF NOT EXISTS materials (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    subject_code VARCHAR(50),
    type VARCHAR(50) NOT NULL DEFAULT 'Notes',
    unit VARCHAR(50) DEFAULT 'Unit 1',
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size VARCHAR(50),
    file_type VARCHAR(50),
    uploaded_by VARCHAR(255) DEFAULT 'CR / Class Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Peer Doubts Table
CREATE TABLE IF NOT EXISTS doubts (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open',
    is_resolved TINYINT(1) DEFAULT 0,
    replies JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert All 58 Students of Cyber Security - D
INSERT INTO students (roll_number, name, email, section, batch, role) VALUES
  ('AP26110090206', 'REPUDI BHARATH', 'repudi_bharath@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090207', 'YADLAPALLI VAISHNAVI', 'yadlapalli_vaishnavi@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090208', 'CHALASANI BRAHMANI', 'chalasani_brahmani@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090209', 'VAKACHARLA ABHISHIKTH', 'vakacharla_abhishikth@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090210', 'MADINENI VENKAT SAI', 'madineni_venkat_sai@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090211', 'BATHULA JAGADIESWAR RAO', 'bathula_jagadieswar_rao@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090212', 'PYLA SHASHANK', 'pyla_shashank@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090213', 'KURMALA JOSHITH RAJ', 'kurmala_joshith_raj@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090214', 'SUDHANSHU BISAI', 'sudhanshu_bisai@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090215', 'SOUMIL SHARMA', 'soumil_sharma@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090216', 'VISHAVJEET KAMBOJ', 'vishavjeet_kamboj@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090217', 'INAMPUDI YASHAS', 'inampudi_yashas@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090218', 'SAKHINALA LAHARI VENKATA DHANA KUMARI', 'sakhinala_lahari@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090219', 'RAMA DAKSHATHA', 'rama_dakshatha@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090220', 'KOTA ASHISH', 'kota_ashish@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090221', 'KAMISETTY THANISHKA', 'kamisetty_thanishka@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090223', 'GORIPATI SAI VENKATA AJAY', 'goripati_sai_venkata_ajay@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090224', 'KARRE PRANEETHA SREE', 'karre_praneetha_sree@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090225', 'KOLA PREM VISHAL KRISHNA SAI', 'kola_prem_vishal@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090226', 'NAYANAPATI VENKAT KOWSHIK KUMAR GUPTA', 'nayanapati_venkat_kowshik@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090227', 'KRISHNA PANDEY', 'krishna_pandey@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090228', 'CHEEKATLA HARSHADEEP', 'cheekatla_harshadeep@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090229', 'JAHNAVI KATEPALLI', 'jahnavi_katepalli@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090230', 'ISHANT SINGH', 'ishant_singh@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090231', 'KODALI BHUVAN CHOWDARY', 'kodali_bhuvan_chowdary@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090232', 'GURRAM VENKATA SAI SANTHOSH GUPTA', 'gurram_venkata_sai@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090233', 'PULAVARTHI SOHAN SAM PRAJWAL', 'pulavarthi_sohan_sam@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090234', 'KONDRAGUNTA KUMAR SAI', 'kondragunta_kumar_sai@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090235', 'NELLURU VINAY KUMAR', 'nelluru_vinay_kumar@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090236', 'YALANATI LIKIL KUMAR', 'yalanati_likil_kumar@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090237', 'TRISHA VERMA', 'trisha_verma@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090238', 'VASAMSETTI SHYAM RISHITA', 'vasamsetti_shyam_rishita@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090239', 'JONNALAGADDA SAI SANJANA', 'jonnalagadda_sai_sanjana@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090241', 'G S MRINAL', 'gs_mrinal@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090242', 'SAIPA MANI HARSHITH', 'saipa_mani_harshith@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090243', 'SODISETTY SRI KRISHNA SAI RAGHAVA', 'sodisetty_sri_krishna@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090244', 'VAIBHAV KUMAR JHA', 'vaibhav_kumar_jha@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090245', 'KOLLI MEGHANA REDDY', 'kolli_meghana_reddy@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090246', 'PATHURI SAKETH', 'pathuri_saketh@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090247', 'MATLAKUNTA VENKATA VARSHITHA', 'matlakunta_venkata@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090248', 'NANDYALA NAVYASRI', 'nandyala_navyasri@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090249', 'DHARANI S R', 'dharani_sr@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090250', 'AVULA GIRIDHAR', 'avula_giridhar@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090251', 'MARAMREDDY ESWAR REDDY', 'maramreddy_eswar_reddy@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090252', 'KANAPARTHI SPANITH', 'kanaparthi_spanith@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090253', 'GUNTI MANOJKUMAR', 'gunti_manojkumar@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090254', 'METLAPALLI PAVAN KUMAR', 'metlapalli_pavan_kumar@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090255', 'SAJJA VAGDEVI', 'sajja_vagdevi@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090256', 'KUNCHALA SNEHALATHA', 'kunchala_snehalatha@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090257', 'SAKHINALA LIKHITHA VENKATA MANI KUMARI', 'sakhinala_likhitha@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090258', 'DAMARLA DHANASMI KRISHNA', 'damarla_dhanasmi_krishna@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090259', 'REDDY SRI SURYA HASITH', 'reddy_sri_surya_hasith@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090260', 'THOTA DINDU SUDHA SREE VALLI', 'thota_dindu_sudha@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090261', 'SINGH NAINAKUMARI MUKESH KUMAR', 'singh_nainakumari@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090262', 'SAI KOUSIK KATRAGADDA', 'sai_kousik_katragadda@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090263', 'GUDIVADA JOTHI NAGA SAI SREEMAYEE', 'gudivada_jothi_naga@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090264', 'SURAJ VISHWAKARMA', 'suraj_vishwakarma@srmap.edu.in', 'D', '2024-2028', 'Student'),
  ('AP26110090265', 'AVIGAYAN JANA', 'avigayan_jana@srmap.edu.in', 'D', '2024-2028', 'CR')
ON DUPLICATE KEY UPDATE 
  name = VALUES(name),
  email = VALUES(email),
  role = VALUES(role);

-- Insert Timetable Slots
INSERT INTO timetable_slots (id, day, period, start_time, end_time, subject, subject_code, faculty, room, type, color) VALUES
  ('tt-mon-1', 'Monday', '3', '11:00', '11:50', 'Art of Listening, Speaking and Reading Skills', 'AEC 101', 'Dr. Antarleena Basu (26093)', 'S 312', 'Lecture', 'blue'),
  ('tt-mon-2', 'Monday', '4', '12:00', '12:50', 'Art of Listening, Speaking and Reading Skills', 'AEC 101', 'Dr. Antarleena Basu (26093)', 'S 312', 'Lecture', 'blue'),
  ('tt-tue-1', 'Tuesday', '1', '09:00', '09:50', 'Analytical Reasoning & Aptitude Skills - I', 'SEC 101', 'Mr. Skilling Course (Tmp124)', 'S 312', 'Tutorial', 'amber'),
  ('tt-tue-2', 'Tuesday', '2', '10:00', '10:50', 'Analytical Reasoning & Aptitude Skills - I', 'SEC 101', 'Mr. Skilling Course (Tmp124)', 'S 312', 'Lecture', 'amber'),
  ('tt-tue-3', 'Tuesday', '5', '13:00', '13:50', 'Fundamentals of Computing & Programming in C (Lab)', 'CSE 101', 'Dr. Mudavath Ravi / Dr. Sahadeb Shit', 'V 602', 'Lab', 'indigo'),
  ('tt-tue-4', 'Tuesday', '6', '14:00', '14:50', 'Fundamentals of Computing & Programming in C (Lab)', 'CSE 101', 'Dr. Mudavath Ravi / Dr. Sahadeb Shit', 'V 602', 'Lab', 'indigo'),
  ('tt-tue-5', 'Tuesday', '7', '15:00', '15:50', 'Engineering Physics', 'FIC 102', 'Dr. Krishna Prasad Maity (24123)', 'S 312', 'Lecture', 'emerald'),
  ('tt-wed-1', 'Wednesday', '1', '09:00', '09:50', 'Fundamentals of Computing & Programming in C', 'CSE 101', 'Dr. Mudavath Ravi (25358)', 'S 312', 'Lecture', 'indigo'),
  ('tt-wed-2', 'Wednesday', '2', '10:00', '10:50', 'Calculus for Engineers', 'FIC 103', 'Dr. Koyel Chakravarty (22108)', 'S 312', 'Lecture', 'purple'),
  ('tt-wed-3', 'Wednesday', '3', '11:00', '11:50', 'Calculus for Engineers', 'FIC 103', 'Dr. Koyel Chakravarty (22108)', 'S 312', 'Lecture', 'purple'),
  ('tt-wed-4', 'Wednesday', '5', '13:00', '13:50', 'Environmental Science', 'VAC 101', 'Dr. Kousik Das (22118)', 'S 312', 'Lecture', 'teal'),
  ('tt-wed-5', 'Wednesday', '6', '14:00', '14:50', 'Environmental Science', 'VAC 101', 'Dr. Kousik Das (22118)', 'S 312', 'Lecture', 'teal'),
  ('tt-thu-1', 'Thursday', '1', '09:00', '09:50', 'Analytical Reasoning & Aptitude Skills - I', 'SEC 101', 'Mr. Skilling Course (Tmp124)', 'S 312', 'Tutorial', 'amber'),
  ('tt-thu-2', 'Thursday', '3', '11:00', '11:50', 'Fundamentals of Computing & Programming in C (Lab)', 'CSE 101', 'Dr. Mudavath Ravi (25358)', 'V 403', 'Lab', 'indigo'),
  ('tt-thu-3', 'Thursday', '4', '12:00', '12:50', 'Fundamentals of Computing & Programming in C (Lab)', 'CSE 101', 'Dr. Mudavath Ravi (25358)', 'V 403', 'Lab', 'indigo'),
  ('tt-thu-4', 'Thursday', '7', '15:00', '15:50', 'Engineering Physics (Lab)', 'FIC 102', 'Dr. Krishna Prasad Maity (24123)', 'V 306', 'Lab', 'emerald'),
  ('tt-thu-5', 'Thursday', '8', '16:00', '17:30', 'Engineering Physics (Lab)', 'FIC 102', 'Dr. Krishna Prasad Maity (24123)', 'V 306', 'Lab', 'emerald'),
  ('tt-fri-1', 'Friday', '3', '11:00', '11:50', 'Engineering Physics', 'FIC 102', 'Dr. Krishna Prasad Maity (24123)', 'S 312', 'Lecture', 'emerald'),
  ('tt-fri-2', 'Friday', '4', '12:00', '12:50', 'Calculus for Engineers', 'FIC 103', 'Dr. Koyel Chakravarty (22108)', 'S 312', 'Lecture', 'purple'),
  ('tt-fri-3', 'Friday', '5', '13:00', '13:50', 'Fundamentals of Computing & Programming in C', 'CSE 101', 'Dr. Mudavath Ravi (25358)', 'S 312', 'Lecture', 'indigo'),
  ('tt-fri-4', 'Friday', '6', '14:00', '14:50', 'Fundamentals of Computing & Programming in C', 'CSE 101', 'Dr. Mudavath Ravi (25358)', 'S 312', 'Lecture', 'indigo')
ON DUPLICATE KEY UPDATE
  day = VALUES(day),
  subject = VALUES(subject),
  faculty = VALUES(faculty),
  room = VALUES(room);
