/**
 * Created by tangsicheng on 2018/4/20.
 */
print('---------------------------Mongodb Start Initialization ---------------------------');
print('---------------------------create collection "jsBundleinfos" ---------------------------');
printjson(db.jsbundleinfos.updateMany({isDeleted:0}, {
        $set: {
            isRelease: true
        }
    },
    {
        upsert:true
    }
))
;