CREATE TABLE IF NOT EXISTS track_ids (
   id UUID PRIMARY KEY,
   date_created TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS hands (
   id UUID PRIMARY KEY,

   date_raised TIMESTAMP WITH TIME ZONE NOT NULL,
   date_lowered TIMESTAMP WITH TIME ZONE,

   priority SMALLINT NOT NULL,
   user_name VARCHAR(128) NOT NULL,
   room_name VARCHAR(256) NOT NULL,
   track_id UUID NOT NULL
);

CREATE UNIQUE INDEX hands_room_name_index
    ON hands (room_name, user_name, priority) WHERE date_lowered IS NULL;
