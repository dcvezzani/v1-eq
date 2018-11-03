import { createFamilyNotes } from './src/api/drive';

const name = "xxx-test-user"
setTimeout(() => {
createFamilyNotes({name}, (err, apiRes) => {
  if (err) return res.json({status: 'error', msg: err.msg, err: err.raw});
  console.log("apiRes", apiRes);
});
}, 3000);
