/**
 * Created by tangsicheng on 2018/3/14.
 */

print('---------------------------Mongodb Start Initialization ---------------------------');
print('---------------------------create collection "users" ---------------------------');
printjson(db.createCollection('users'));
printjson(db.users.update({"userName":"admin"},
    {
        userName: "admin",
        password: '$2a$10$U/DvuYQZl3gEYSrd9UGNa.GXqvINldzjA4SrRtQB4pPomarrtX3fS' ,
        roles: ["admin"],
        token:'',
        createTime:new Date().getTime(),
        createBy:'init',
        updateTime:new Date().getTime(),
        updateBy:'init',
        isDeleted:0
    },
    {
        upsert:true
    }
));
//db.users.insert({userName:'admin',password:'$2a$10$U/DvuYQZl3gEYSrd9UGNa.GXqvINldzjA4SrRtQB4pPomarrtX3fS'})