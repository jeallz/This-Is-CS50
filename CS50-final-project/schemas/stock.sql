create table stock (
    discord_id varchar(50) not null,
    pet_food int default 0,
    premium_pet_food int default 0,
    gourmet_pet_food int default 0,
    chicken int default 0,
    fillet int default 0,
    primary key (discord_id),
    foreign key (discord_id) references users(discord_id)
);
