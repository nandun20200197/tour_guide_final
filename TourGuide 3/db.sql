create table guide
(
    uid             int              not null
        constraint `PRIMARY`
        primary key,
    availability    text             not null,
    services        text             not null,
    experiences     text             not null,
    recommendations text             null,
    price           double default 0 not null,
    constraint uid
        unique (uid)
);

create table guide_images
(
    id    int auto_increment
        constraint `PRIMARY`
        primary key,
    uid   int      null,
    place int      null,
    image longtext not null,
    constraint id
        unique (id)
);

create table guide_reservation
(
    id      int auto_increment
        constraint `PRIMARY`
        primary key,
    uid     int  null,
    gid     int  null,
    place   int  null,
    `from`  text not null,
    `to`    text not null,
    persons int  not null,
    constraint id
        unique (id)
);

create table message
(
    id     int auto_increment
        constraint `PRIMARY`
        primary key,
    `from` int  null,
    `to`   int  null,
    time   text not null,
    text   text not null
);

create table package
(
    id          int auto_increment
        constraint `PRIMARY`
        primary key,
    uid         int    null,
    name        text   not null,
    description text   not null,
    created     text   not null,
    activities  text   not null,
    services    text   not null,
    extra       text   null,
    price       double null,
    days        text   null,
    guides      text   null,
    hotel       int    null,
    transport   int    null,
    travel_cost double null,
    person      int    null,
    constraint id
        unique (id)
);

create table place
(
    id          int auto_increment
        constraint `PRIMARY`
        primary key,
    name        text             not null,
    description text             not null,
    category    text             not null,
    address     text             not null,
    latitude    double           not null,
    longitude   double           not null,
    image       longtext         null,
    extra       longtext         null,
    price       double default 0 not null
);

create table place_image
(
    id    int auto_increment
        constraint `PRIMARY`
        primary key,
    pid   int      null,
    image longtext not null
);

create table rating
(
    id     int auto_increment
        constraint `PRIMARY`
        primary key,
    uid    int  not null,
    rid    int  null,
    type   text not null,
    rating int  not null
);

create table reservations
(
    id      int auto_increment
        constraint `PRIMARY`
        primary key,
    uid     int  null,
    place   int  null,
    `from`  text not null,
    `to`    text not null,
    persons int  not null,
    constraint id
        unique (id)
);

create table review
(
    id      int  not null
        constraint `PRIMARY`
        primary key,
    uid     int  null,
    xid     int  null,
    rating  int  null,
    comment text not null,
    type    text not null,
    constraint id
        unique (id)
);

create table rider
(
    id   int auto_increment
        constraint `PRIMARY`
        primary key,
    name text not null
);

create table user
(
    id          int auto_increment
        constraint `PRIMARY`
        primary key,
    username    varchar(100) not null,
    full_name   text         not null,
    email       varchar(100) not null,
    phone       varchar(100) not null,
    password    text         not null,
    type        text         not null,
    status      text         not null,
    experience  text         null,
    preferences text         null,
    licence     longtext     null,
    constraint email
        unique (email),
    constraint phone
        unique (phone),
    constraint username
        unique (username)
);


