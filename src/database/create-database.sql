-- Base de datos para el servicio de entrevistas
CREATE DATABASE interview_service_db;
-- Tabla de configuración de entrevistas
CREATE TABLE interview_configs (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL,
    job_role_id UUID NOT NULL,
    seniority_id UUID NOT NULL,
    duration_minutes INTEGER NOT NULL,
    num_questions INTEGER NOT NULL,
    complexity_level INTEGER CHECK (
        complexity_level BETWEEN 1 AND 5
    ),
    validity_hours INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Tabla de entrevistas
CREATE TABLE interviews (
    interview_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL,
    config_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    scheduled_date TIMESTAMP WITH TIME ZONE,
    expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    video_recording_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Tabla de preguntas
CREATE TABLE questions (
    question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_role_id UUID NOT NULL,
    seniority_id UUID NOT NULL,
    question_text TEXT NOT NULL,
    expected_answer TEXT,
    complexity_level INTEGER CHECK (
        complexity_level BETWEEN 1 AND 5
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Tabla de resultados de entrevista
CREATE TABLE interview_results (
    result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL,
    question_id UUID NOT NULL,
    candidate_answer TEXT,
    rating INTEGER CHECK (
        rating BETWEEN 1 AND 5
    ),
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Tabla de reportes de entrevista
CREATE TABLE interview_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL,
    company_report JSONB,
    candidate_report JSONB,
    overall_score DECIMAL(5, 2),
    recommendations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);