-- TryIt-AI Comprehensive Analytics Schema
-- Designed for anonymous session tracking with full analytical capabilities
-- Supports phased implementation and future monetization

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- PHASE 1: ESSENTIAL DATA CAPTURE (MESSAGES + ARTIFACTS)
-- Implement immediately: Sessions, Conversations, Messages, Tools, Tool Usage
-- ====================================

-- Anonymous user sessions (privacy-first)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_fingerprint VARCHAR(255) UNIQUE, -- Browser fingerprint (non-PII)
    environment VARCHAR(20) NOT NULL CHECK (environment IN ('development', 'preview', 'production')),
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_conversations INTEGER DEFAULT 0,
    total_tools_generated INTEGER DEFAULT 0,
    average_trust_level FLOAT DEFAULT 50.0,
    session_frequency_category VARCHAR(20) CHECK (session_frequency_category IN ('first-time', 'occasional', 'regular', 'power-user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation-level analytics
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    conversation_sequence INTEGER NOT NULL, -- 1st, 2nd, 3rd conversation for this session
    initial_trust_level INTEGER DEFAULT 50 CHECK (initial_trust_level >= 0 AND initial_trust_level <= 100),
    final_trust_level INTEGER CHECK (final_trust_level >= 0 AND final_trust_level <= 100),
    trust_trajectory VARCHAR(20) CHECK (trust_trajectory IN ('improving', 'declining', 'stable', 'volatile')),
    skeptic_mode_enabled BOOLEAN DEFAULT FALSE,
    skeptic_mode_activations INTEGER DEFAULT 0,
    conversation_length INTEGER DEFAULT 0, -- Total messages
    conversation_duration INTEGER, -- Duration in seconds
    conversation_topic VARCHAR(100), -- Inferred topic category
    conversation_complexity VARCHAR(20) CHECK (conversation_complexity IN ('simple', 'moderate', 'complex', 'expert')),
    user_engagement_level VARCHAR(20) CHECK (user_engagement_level IN ('low', 'medium', 'high', 'very-high')),
    completion_status VARCHAR(20) CHECK (completion_status IN ('completed', 'abandoned', 'interrupted', 'error')),
    abandonment_point INTEGER, -- Message number where conversation was abandoned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual message tracking
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_sequence INTEGER NOT NULL, -- Order within conversation
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content_length INTEGER NOT NULL,
    word_count INTEGER DEFAULT 0,
    message_type VARCHAR(30) CHECK (message_type IN ('question', 'request', 'challenge', 'feedback', 'clarification', 'response', 'tool-generation')),
    complexity_score FLOAT CHECK (complexity_score >= 0 AND complexity_score <= 1),
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
    contains_challenge BOOLEAN DEFAULT FALSE,
    contains_uncertainty BOOLEAN DEFAULT FALSE,
    response_time_ms INTEGER, -- For assistant messages
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- PHASE 2: AGENT PERFORMANCE TRACKING
-- ====================================

-- Agent interaction analytics
CREATE TABLE agent_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    agent_type VARCHAR(20) NOT NULL CHECK (agent_type IN ('noah', 'wanderer', 'tinkerer')),
    interaction_type VARCHAR(30) CHECK (interaction_type IN ('direct-response', 'delegation', 'research', 'tool-generation', 'collaboration')),
    processing_time_ms INTEGER NOT NULL,
    success_status VARCHAR(20) CHECK (success_status IN ('success', 'partial', 'failure', 'timeout', 'error')),
    delegation_reason VARCHAR(100), -- Why Noah delegated
    confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- PHASE 3: TOOL GENERATION & ADOPTION TRACKING
-- ====================================

-- Generated tools library
CREATE TABLE generated_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    tool_hash VARCHAR(64) UNIQUE, -- Content hash for deduplication
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tool_type VARCHAR(50) NOT NULL, -- 'calculator', 'converter', 'visualizer', etc.
    tool_category VARCHAR(50), -- Broader categorization
    complexity_level VARCHAR(20) CHECK (complexity_level IN ('simple', 'moderate', 'complex', 'advanced')),
    generation_time_ms INTEGER NOT NULL,
    generation_agent VARCHAR(20) CHECK (generation_agent IN ('noah', 'tinkerer')),
    content_length INTEGER NOT NULL,
    rag_components_used INTEGER DEFAULT 0,
    reasoning_provided TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tool usage and adoption tracking
CREATE TABLE tool_usage_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id UUID NOT NULL REFERENCES generated_tools(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(30) CHECK (event_type IN ('generated', 'viewed', 'interacted', 'downloaded', 'shared', 'reused')),
    usage_context VARCHAR(50), -- 'same-session', 'different-session', 'recycled'
    user_feedback VARCHAR(20) CHECK (user_feedback IN ('positive', 'negative', 'neutral', 'no-feedback')),
    interaction_duration INTEGER, -- Time spent with tool
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- PHASE 4: RAG & KNOWLEDGE BASE ANALYTICS
-- ====================================

-- RAG query analytics
CREATE TABLE rag_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    query_type VARCHAR(30) CHECK (query_type IN ('knowledge-lookup', 'component-search', 'similarity-search', 'context-building')),
    components_retrieved INTEGER DEFAULT 0,
    retrieval_time_ms INTEGER NOT NULL,
    relevance_score FLOAT CHECK (relevance_score >= 0 AND relevance_score <= 1),
    components_used INTEGER DEFAULT 0, -- How many retrieved components were actually used
    query_success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge component usage tracking
CREATE TABLE knowledge_component_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rag_query_id UUID NOT NULL REFERENCES rag_queries(id) ON DELETE CASCADE,
    component_id VARCHAR(255) NOT NULL, -- ChromaDB component ID
    component_type VARCHAR(50), -- 'knowledge', 'artifact', 'conversation'
    relevance_score FLOAT CHECK (relevance_score >= 0 AND relevance_score <= 1),
    usage_rank INTEGER, -- 1st, 2nd, 3rd most relevant component used
    contributed_to_response BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- PHASE 5: TRUST & BEHAVIORAL ANALYTICS
-- ====================================

-- Trust level changes and events
CREATE TABLE trust_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    previous_trust_level INTEGER CHECK (previous_trust_level >= 0 AND previous_trust_level <= 100),
    new_trust_level INTEGER CHECK (new_trust_level >= 0 AND new_trust_level <= 100),
    trust_change INTEGER, -- Calculated: new - previous
    change_trigger VARCHAR(50), -- 'challenge', 'success', 'skeptic-mode', 'tool-adoption', etc.
    recovery_strategy VARCHAR(50), -- If trust decreased, what strategy was used
    event_context TEXT, -- Additional context about the trust change
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- PHASE 6: SYSTEM PERFORMANCE & OPTIMIZATION
-- ====================================

-- System performance metrics
CREATE TABLE system_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    measurement_type VARCHAR(30) CHECK (measurement_type IN ('response-time', 'agent-processing', 'rag-query', 'tool-generation', 'error-event')),
    component VARCHAR(30), -- 'noah', 'wanderer', 'tinkerer', 'rag', 'database', 'api'
    duration_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_type VARCHAR(50),
    error_message TEXT,
    resource_usage JSONB, -- CPU, memory, etc. if available
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- ANALYTICAL VIEWS FOR BUSINESS INTELLIGENCE
-- ====================================

-- User journey analytics view
CREATE VIEW user_journey_analytics AS
SELECT 
    s.id as session_id,
    s.session_frequency_category,
    s.total_conversations,
    s.total_tools_generated,
    s.average_trust_level,
    COUNT(c.id) as completed_conversations,
    AVG(c.conversation_length) as avg_conversation_length,
    AVG(c.conversation_duration) as avg_conversation_duration,
    COUNT(CASE WHEN c.completion_status = 'completed' THEN 1 END) as completion_rate,
    COUNT(gt.id) as tools_created,
    COUNT(tue.id) as tool_usage_events
FROM user_sessions s
LEFT JOIN conversations c ON s.id = c.session_id
LEFT JOIN generated_tools gt ON s.id = gt.session_id
LEFT JOIN tool_usage_events tue ON s.id = tue.session_id
GROUP BY s.id, s.session_frequency_category, s.total_conversations, s.total_tools_generated, s.average_trust_level;

-- Agent performance comparison view
CREATE VIEW agent_performance_analytics AS
SELECT 
    ai.agent_type,
    COUNT(*) as total_interactions,
    AVG(ai.processing_time_ms) as avg_processing_time,
    COUNT(CASE WHEN ai.success_status = 'success' THEN 1 END)::float / COUNT(*) as success_rate,
    AVG(ai.confidence_score) as avg_confidence,
    COUNT(CASE WHEN ai.interaction_type = 'delegation' THEN 1 END) as delegations_made
FROM agent_interactions ai
GROUP BY ai.agent_type;

-- Tool effectiveness analytics view
CREATE VIEW tool_effectiveness_analytics AS
SELECT 
    gt.tool_type,
    gt.tool_category,
    COUNT(*) as tools_generated,
    AVG(gt.generation_time_ms) as avg_generation_time,
    AVG(gt.complexity_level::text) as avg_complexity,
    COUNT(tue.id) as total_usage_events,
    COUNT(CASE WHEN tue.event_type = 'reused' THEN 1 END) as reuse_count,
    COUNT(CASE WHEN tue.user_feedback = 'positive' THEN 1 END)::float / 
        NULLIF(COUNT(CASE WHEN tue.user_feedback IS NOT NULL THEN 1 END), 0) as positive_feedback_rate
FROM generated_tools gt
LEFT JOIN tool_usage_events tue ON gt.id = tue.tool_id
GROUP BY gt.tool_type, gt.tool_category;

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================

-- Core entity indexes
CREATE INDEX idx_user_sessions_fingerprint ON user_sessions(session_fingerprint);
CREATE INDEX idx_user_sessions_last_seen ON user_sessions(last_seen);
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);

-- Analytics indexes
CREATE INDEX idx_agent_interactions_agent_type ON agent_interactions(agent_type);
CREATE INDEX idx_agent_interactions_conversation_id ON agent_interactions(conversation_id);
CREATE INDEX idx_generated_tools_tool_type ON generated_tools(tool_type);
CREATE INDEX idx_generated_tools_session_id ON generated_tools(session_id);
CREATE INDEX idx_tool_usage_events_tool_id ON tool_usage_events(tool_id);
CREATE INDEX idx_trust_events_session_id ON trust_events(session_id);
CREATE INDEX idx_rag_queries_conversation_id ON rag_queries(conversation_id);

-- Composite indexes for common queries
CREATE INDEX idx_conversations_session_sequence ON conversations(session_id, conversation_sequence);
CREATE INDEX idx_messages_conversation_sequence ON messages(conversation_id, message_sequence);
CREATE INDEX idx_trust_events_conversation_created ON trust_events(conversation_id, created_at);

-- ====================================
-- ROW LEVEL SECURITY
-- ====================================

-- Enable RLS on all tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_component_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_performance ENABLE ROW LEVEL SECURITY;

-- Service role policies (for application access)
CREATE POLICY "Service role full access" ON user_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON conversations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON messages FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON agent_interactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON generated_tools FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON tool_usage_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON rag_queries FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON knowledge_component_usage FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON trust_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON system_performance FOR ALL USING (auth.role() = 'service_role');

-- ====================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ====================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update session statistics
CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_sessions 
        SET 
            total_conversations = total_conversations + 1,
            last_seen = NOW()
        WHERE id = NEW.session_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_session_stats_on_conversation AFTER INSERT ON conversations FOR EACH ROW EXECUTE FUNCTION update_session_stats();