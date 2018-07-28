import { exec } from 'child_process';
import fs from 'fs';
import moment from 'moment';
import { sendShellCommand as sendShellCommandAction } from './../actions/shell'

const V1_DIR_TEXT_CACHE = "/Users/davidvezzani/clients/v1-eq/be/data/v1-dir-text-cache.txt";

// curl http://localhost:3000/sms/text -XPOST --data '{"title":"Bro.", "lastname":"Johansen", "phone":"8013333333", "visitTime":"3:30pm", "visitDate":"7/29"}' -H "Content-Type: application/json"
// curl http://localhost:3000/sms/text -XPOST --data '{"data":"ZWNobyAiLi4uIFNlbmRpbmcgdGV4dDogVmV6emFuaSAyMDk3NTY5Njg4Igpvc2FzY3JpcHQgIiRIT01FL3NjcmlwdHMvc2VuZC5zY3B0IiArMSIyMDk3NTY5Njg4IiAiRGVhciBCcm8uIFZlenphbmksIAoKVGhpcyBpcyBCcm8uIERhdmlkIFZlenphbmkgZnJvbSB0aGUgVmluZXlhcmQgMXN0IFdhcmQuoKBJIGhvcGUgdGhhdCB5b3UgaGF2ZSBiZWVuIGVuam95aW5nIGEgd29uZGVyZnVsIHdlZWsuCgpOb3QgbG9uZyBhZ28gSSBhc2tlZCBpZiB5b3Ugd291bGQgYmUgYW1lbmFibGUgdG8gYSB2aXNpdCBmcm9tIHRoZSBFbGRlcnMgUXVvcnVtIHByZXNpZGVuY3kuICBIb3cgd291bGQgMzozMHBtIG9uIFN1bmRheSwgSnVsIDI5dGggd29yayBmb3IgeW91PyAKCkxldCBtZSBrbm93IGFuZCBJIGNhbiBzY2hlZHVsZSB0aGUgdmlzaXQgb3Igd2UgY2FuIHNjaGVkdWxlIGEgYmV0dGVyIHRpbWUgdGhhdCB3b3JrcyBmb3IgeW91LgoKLSBEYXZpZCBWZXp6YW5pOiAyMDktNzU2LTk2ODg7IGRjdmV6emFuaUBnbWFpbC5jb20KLSBQcmVzLiBUcm95IFNtaXRoIChFbGRlcnMgUXVvcnVtIFByZXNpZGVudCk6IDgwMS05MjEtOTU1NTsgdHJveXdzbWl0aDgyQGdtYWlsLmNvbQoKV2UgbG9vayBmb3J3YXJkIHRvIHZpc2l0aW5nIHdpdGggeW91IHNvb24uCgpTaW5jZXJlbHksCgotLSBCcm8uIFZlenphbmkgKEVsZGVycyBRdW9ydW0gU2VjcmV0YXJ5KQoiCg=="}' -H "Content-Type: application/json"

export const sendShellCommand = (req, res, next) => {
  sendShellCommandAction(req.body.data, (err, { cmd, stdout }) => {
    res.json({ err, cmd, stdout });
  });
};

