

-- 创建数据库
CREATE DATABASE IF NOT EXISTS provate_test_bbs CHARACTER SET utf8 COLLATE utf8_general_ci;

-- 使用数据库
USE provate_test_bbs;

-- 创建用户数据表
-- NOT NULL设置字段不能为空，在操作数据库时如果输入该字段的数据为NULL ，就会报错。
-- AUTO_INCREMENT定义列为自增的属性，一般用于主键，数值会自动加1。
--  VARCHAR(100)表示该字段最大字符的个数是100
-- PRIMARY KEY关键字用于定义列为主键。 您可以使用多列来定义主键，列间以逗号分隔。
-- FOREIGN KEY(`parent_id`) REFERENCES plateM(`pid`)   对两个表的数据进行关联，references后的数据要在表中是key 主键
CREATE TABLE IF NOT EXISTS `user`(`id`  VARCHAR(40) UNSIGNED,`name` VARCHAR(100) NOT NULL,`nickName`  VARCHAR(100),`password`  VARCHAR(40) NOT NULL,`icon`  VARCHAR(100),`create_time` VARCHAR(100),`lastLoginTime` VARCHAR(100),`gender` VARCHAR(20),`introduction` VARCHAR(1000),`isLogin` TINYINT(1) NOT NULL DEFAULT 1,`identity` VARCHAR(20) NOT NULL DEFAULT 'user',PRIMARY KEY ( `id` ))ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 给用户表添加数据
INSERT INTO `user` (`id`,`name`,`nickName`,`password`,`icon`,`create_time`,`lastLoginTime`,`identity`) VALUES('admin-#z','administrator','administrator','123456','default.svg','2024-03-19','2024-03-19','root');
INSERT INTO `user` (`id`,`name`,`nickName`,`password`,`icon`,`create_time`,`lastLoginTime`,`identity`) VALUES(1,'mytest01','test','123456','default.svg','2024-03-21','2024-03-21','adminstrator');
INSERT INTO `user` (`id`,`name`,`nickName`,`password`,`icon`,`create_time`,`lastLoginTime`,`identity`) VALUES(2,'test001','test','123456','default.svg','2024-04-22','2024-03-21','user');


-- 创建大板块表和小板块表
CREATE TABLE IF NOT EXISTS `platem`(`pid` VARCHAR(40) UNSIGNED NOT NULL,`name` VARCHAR(100) NOT NULL,PRIMARY KEY (`pid`))ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE IF NOT EXISTS `platen`(`cid` VARCHAR(40) UNSIGNED NOT NULL,`name` VARCHAR(100) NOT NULL,`parent_id` VARCHAR(40) UNSIGNED,PRIMARY KEY (`cid`),FOREIGN KEY(`parent_id`) REFERENCES platem(`pid`) ON DELETE CASCADE)ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 添加大板块的数据
insert into `platem`(`pid`,`name`)values('129','社会与生活');
insert into `platem`(`pid`,`name`)values('130','开发与编程');
insert into `platem`(`pid`,`name`)values('131','互助区');
-- 添加小板块的数据
insert into `platen`(`cid`,`name`,`parent_id`)values('1920','厨艺','129');
insert into `platen`(`cid`,`name`,`parent_id`)values('1921','园艺','129');
insert into `platen`(`cid`,`name`,`parent_id`)values('1923','Python','130');
insert into `platen`(`cid`,`name`,`parent_id`)values('1922','JavaScript','130');
insert into `platen`(`cid`,`name`,`parent_id`)values('1924','C++','130');
insert into `platen`(`cid`,`name`,`parent_id`)values('1925','疑难解答','131');
insert into `platen`(`cid`,`name`,`parent_id`)values('1926','AI技术','131');
insert into `platen`(`cid`,`name`,`parent_id`)values('1927','技术分享','131');

-- 创建帖子数据表
CREATE TABLE IF NOT EXISTS `posts`(`tid` VARCHAR(40) UNSIGNED NOT NULL,`title` VARCHAR(200) NOT NULL,`abstract` TEXT,`content` TEXT NOT NULL,`create_time` VARCHAR(100),`like` VARCHAR(1000) default '[]',`tImg` VARCHAR(1000),`pid` VARCHAR(40) UNSIGNED,`cid` VARCHAR(40) UNSIGNED,`uid` VARCHAR(40) UNSIGNED,PRIMARY KEY (`tid`),FOREIGN KEY (`uid`) REFERENCES user(`id`) ON DELETE CASCADE,FOREIGN KEY (`pid`) REFERENCES platem(`pid`) ON DELETE CASCADE,FOREIGN KEY (`cid`) REFERENCES platen(`cid`) ON DELETE CASCADE)ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 添加帖子数据
INSERT INTO `posts`(`tid`,`title`,`abstract`,`content`,`create_time`,`tImg`,`pid`,`cid`,`uid`)VALUES('999','1212','this is my test post','1111111','2024-03-20 8:00',null,'130','1923','admin-#z');
INSERT INTO `posts`(`tid`,`title`,`abstract`,`content`,`create_time`,`tImg`,`pid`,`cid`,`uid`)VALUES('1000','1212','this is my test post','1111111','2024-03-20 8:00',null,'130','1923','admin-#z');

-- 添加留言数据
CREATE TABLE IF NOT EXISTS `leavel`(`lid` VARCHAR(40) UNSIGNED NOT NULL,`uid` VARCHAR(40) UNSIGNED,`tid` VARCHAR(40) UNSIGNED,`value` VARCHAR(1000) NOT NULL ,`index` INT,`createTime` VARCHAR(100),`like` VARCHAR(1000),`plid` VARCHAR(40) UNSIGNED,PRIMARY KEY (`lid`) ,FOREIGN KEY(`uid`) REFERENCES user(`id`) ON DELETE CASCADE,FOREIGN KEY(`tid`) REFERENCES posts(`tid`) ON DELETE CASCADE,FOREIGN KEY (`plid`) REFERENCES leavel(`lid`) ON DELETE CASCADE)ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `leavel`(`lid`,`uid`,`tid`,`value`,`index`,`createTime`,`like`)values('1001','admin-#z','999','123211111',-1,'2023-03-22 20:26',"['admin-#z']")
INSERT INTO `leavel`(`lid`,`uid`,`tid`,`value`,`index`,`createTime`,`like`)values('1002','admin-#z','999','123211111',-1,'2023-03-22 20:28','[]')
INSERT INTO `leavel`(`lid`,`uid`,`tid`,`value`,`index`,`createTime`,`like`,`plid`)values('1003','admin-#z','999','123211111','admin-#z','2023-03-22 20:29','[]','1001')

-- -- 添加消息数据
CREATE TABLE IF NOT EXISTS `message`(`mid` VARCHAR(40) UNSIGNED NOT NULL,`uid` VARCHAR(40) UNSIGNED,`wid` VARCHAR(40) UNSIGNED,`lid` VARCHAR(40) UNSIGNED,`type` VARCHAR(30) NOT NULL,`tid` VARCHAR(40) UNSIGNED,`isread` INT,PRIMARY KEY(`mid`),FOREIGN KEY(`uid`) REFERENCES user(`id`) ON DELETE CASCADE,FOREIGN KEY(`wid`) REFERENCES user(`id`) ON DELETE CASCADE,FOREIGN KEY(`tid`) REFERENCES posts(`tid`) ON DELETE CASCADE,FOREIGN KEY(`lid`) REFERENCES leavel(`lid`) ON DELETE CASCADE)ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `message`(`mid`,`uid`,`wid`,`type`,`tid`,`isread`)VALUES('4567','admin-#z','admin-#z','post','999','admin-#z');
INSERT INTO `message`(`mid`,`uid`,`wid`,`type`,`lid`,`tid`,`isread`)VALUES('4569','admin-#z','admin-#z','like_leavel','1002','999','admin-#z');

-- 创建日志表
CREATE TABLE IF NOT EXISTS `logs`(`gid` INT NOT NULL AUTO_INCREMENT,`uid` VARCHAR(40) UNSIGNED,`create_time` VARCHAR(100),`identity` VARCHAR(20) DEFAULT 'user',`value` VARCHAR(1000),PRIMARY KEY(`gid`),FOREIGN KEY(`uid`) REFERENCES user(`id`) ON DELETE CASCADE)ENGINE=InnoDB DEFAULT CHARSET=utf8;

