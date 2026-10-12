create table users (
    id int not null auto_increment,
    username varchar(50) not null,
    discord_id varchar(50) default null,
    money decimal(15,2) default 0.00,
    bank decimal(15,2) default 0.00,
    created_at datetime not null default current_timestamp,
    last_daily datetime default null,
    job enum('Programmer','Designer','Doctor','Baker','Professor','Advocate','Fisherman') default null,
    level int not null default 0,
    last_work datetime default null,
    xp int default 0,
    primary key (id),
    unique key discord_id (discord_id)
);
