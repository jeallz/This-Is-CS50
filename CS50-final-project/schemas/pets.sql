create table pets (
    discord_id varchar(50) not null,
    name varchar(50) not null,
    species enum('Dog','Cat','Snake') not null,
    xp int not null default 0,
    level int not null default 1,
    happiness int not null default 100,
    hunger datetime not null default current_timestamp,
    last_played datetime default current_timestamp,
    primary key (discord_id),
    foreign key (discord_id) references users(discord_id)
);