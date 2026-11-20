
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id, group_id)
);

CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    contribution_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (member_id, group_id)
        REFERENCES members(id, group_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_members_group_id
    ON members(group_id);

CREATE INDEX IF NOT EXISTS idx_contributions_group_id
    ON contributions(group_id);

CREATE INDEX IF NOT EXISTS idx_contributions_member_id
    ON contributions(member_id);

