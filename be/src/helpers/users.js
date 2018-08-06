var async = require('async');
import { exec } from 'child_process';
const jq = require('node-jq')
import fs from 'fs';
import moment from 'moment';
import db from './../../db'
import member from './../models/members'
import { createFamilyNotes } from '../api/drive';

const V1_DIR_LISTING_URL = "https://www.lds.org/directory/services/web/v3.0/mem/member-list/13730"
const V1_DIR_MEMBER_DETAILS_URL = "https://www.lds.org/directory/services/web/v3.0/mem/householdProfile/${householdId}?imageSize=MEDIUM"
const V1_DIR_EQ_LISTING_URL = "https://www.lds.org/mls/mbr/services/orgs/sub-orgs-with-callings?lang=eng&subOrgId=5873015"
const V1_DIR_RS_LISTING_URL = "https://www.lds.org/mls/mbr/services/orgs/sub-orgs-with-callings?lang=eng&subOrgId=209076&unitNumber=13730"

const v1DirMemberDetailsUrl = (householdId) => {
	return V1_DIR_MEMBER_DETAILS_URL.replace(/\$\{householdId\}/g, householdId);
};

const jsessionid = "JSESSIONID=4F2C18204E437169598FF43428323328; audience_split=66; aam_uuid=59021978805140378433128153389350885285; disable-footnotes=true; audience_id=501805; ldsorg_profile=%7B%22lastUser%22%3A%223694966261%22%2C%22users%22%3A%7B%223694966261%22%3A%7B%22nbIntro%22%3A0%2C%22nbMode%22%3A1%2C%22nbToolbar%22%3A1%2C%22nbColor%22%3A%22hl-color-1%22%2C%22nbFolder%22%3Anull%2C%22editId%22%3Anull%2C%22nbView%22%3A1%7D%7D%7D; _CT_RS_=Recording; WRUID=1734156077318192; lds-preferred-lang=eng; aam_sc=aamsc%3D708195%7C855179; AMCV_66C5485451E56AAE0A490D45%40AdobeOrg=1099438348%7CMCIDTS%7C17687%7CMCMID%7C58906328506240852853115932400075023059%7CMCAAMLH-1528340008%7C9%7CMCAAMB-1528694169%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1528096569s%7CNONE%7CMCAID%7CNONE%7CMCSYNCSOP%7C411-17690%7CvVersion%7C2.1.0; check=true; s_cc=true; audience_s_split=77; lds-youtube=true; __CT_Data=gpv=10&ckp=tld&dm=lds.org&apv_59_www11=10&cpv_59_www11=10&rpv_59_www11=10; amlbcookie=76; ctm={'pgv':4427632412847387|'vst':6327551701040104|'vstr':6736419646463608|'intr':1528130854484|'v':1|'lvst':2634}; TS01b89640=01999b7023967d36240b2eb41d7e81ac4e1c4f71779c9891ab4790815a5ad2d952b0378bfa8d264d451b9ac4d610a08ad32b75b8cda6ad0a1ffda23eb3e54c8d08faa4f0a3; lds-id=AQIC5wM2LY4Sfcyg5vfqD5p0QCWvcaSipJRgJh-70lB7m2Y.*AAJTSQACMDIAAlNLABMxNzkxNzE5MDkzOTMxNDExMjg2AAJTMQACMDY.*; __VCAP_ID__=d316e65d-bae7-4eb5-71a4-0724; s_sq=ldsall%3D%2526pid%253Dhttps%25253A%25252F%25252Fwww.lds.org%25252Fmls%25252Fmbr%25252F%25253Flang%25253Deng%2526oid%253Dhttps%25253A%25252F%25252Fwww.lds.org%25252Fdirectory%25252F%25253Flang%25253Deng%2526ot%253DA; s_ppvl=lds.org%253A%2F%2C35%2C30%2C718%2C1264%2C718%2C2560%2C1440%2C1%2CL; utag_main=v_id:01613d1c695300571a5f4e0e1ad00407900470710093c$_sn:52$_ss:0$_st:1528132662807$vapi_domain:lds.org$dc_visit:48$ses_id:1528130850810%3Bexp-session$_pn:3%3Bexp-session$dc_event:4%3Bexp-session$dc_region:us-east-1%3Bexp-session; s_ppv=https%253A%2F%2Fwww.lds.org%2Fdirectory%2F%253Flang%253Deng%2C98%2C57%2C718%2C1264%2C718%2C2560%2C1440%2C1%2CL; mbox=PC#fa0bff93ae4543ce8c4dcc46ddc4b1e7.28_15#1591375652|session#6e993201abc442c1b671f74866d05156#1528132724; ObSSOCookie=oFlSEaHFaU3Bw94ItvytqNXEMWM6AtgF1b15M7tNOEcyOsbsnTcW8f%2BVjmKIBwlTAruH63r%2B3ivD%2FjT4qmMUvuLC0BheEtM50mnW1AEPr1rxSLLh5fJFjgDGxUAXFiVZMGSpvQNv1khik7iZUm8A9K9JbjC90ZjLHK2Xe83sHljRLlXTW4KZ43fY3rBe4%2BNdfguEWL1sHAYP%2FkQxNZ%2F4frmI6F9yBL47lrHPHrKW5q1og3vBg0047BdLadUwtHlSPwZiWiesy0MpD31ys7dt31rgNkV%2BLoiSnH3C2SIyOUqQ8%2FLTDOEHxG0HJbdjjpi1p0BLdfxLE5HtTYWjCxcg6JeAaRyfcOFEp%2B3WTUH44%2FY%3D; t_ppv=undefined%2C98%2C57%2C718%2C12328";

const LDS_CMD = "curl '${url}' -H 'pragma: no-cache' -H $'cookie: ${jsessionid}' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36' -H 'accept: application/json, text/javascript, */*; q=0.01' -H 'cache-control: no-cache' -H 'authority: www.lds.org' -H 'x-requested-with: XMLHttpRequest' -H 'referer: https://www.lds.org/directory/?lang=eng' --compressed";

const ldsCmd = (url) => {
	return LDS_CMD.replace(/\$\{url\}/g, url).replace(/\$\{jsessionid\}/g, jsessionid);
}

const dirListingCmd = () => ldsCmd(V1_DIR_LISTING_URL);
const dirMemberDetailsCmd = (householdId) => ldsCmd(v1DirMemberDetailsUrl(householdId));
const dirEqListingCmd = () => ldsCmd(V1_DIR_EQ_LISTING_URL);
const dirRsListingCmd = () => ldsCmd(V1_DIR_RS_LISTING_URL);

const V1_DIR_LISTING_CACHE = "/Users/dcvezzani/projects/v1-eq/be/data/v1-dir-listing.json";
const V1_MEMBER_DETAILS_CACHE = "/Users/dcvezzani/projects/v1-eq/be/data/v1-member-details.json";
const V1_DIR_EQ_LISTING_CACHE = "/Users/dcvezzani/projects/v1-eq/be/data/v1-dir-eq-listing.json";
const V1_DIR_RS_LISTING_CACHE = "/Users/dcvezzani/projects/v1-eq/be/data/v1-dir-rs-listing.json";
const CMD_CACHE = "/Users/dcvezzani/projects/v1-eq/be/data/cmd.txt";

export const indexMembers = (req, res, next) => {
	member.all(req.query, (err, members) => {
		if (err) return res.json({status: 'error', msg: err.msg, err: err.raw});
		res.json({ members });
	});
};

export const createNotes = (req, res, next) => {
  createFamilyNotes(req.body, (err, apiRes) => {
		if (err) return res.json({status: 'error', msg: err.msg, err: err.raw});
    console.log("apiRes", apiRes);
		res.json({ apiRes });
  });
};

export const getMember = (req, res, next) => {
	member.show(req.params.id, (err, member) => {
		if (err) return res.json({status: 'error', msg: err.msg, err: err.raw});
		res.json({ member });
	});
};

export const updateMember = (req, res, next) => {
	member.update(req.params.id, req.body, (err, member) => {
		if (err) return res.json({status: 'error', msg: err.msg, err: err.raw});
		res.json({ member });
	});
};

export const syncMembershipRecords = (req, res, next) => {
	const data = {memberDetails: []}
	const tasks = [
		(cb) => {
			fetchDirListing((err, json) => {
				if (err) return cb(err);
				data.json = json;
				cb();
			});
		},
		(cb) => {
			parseDirListing(data.json, (err, json) => {
				if (err) return cb(err);
				// console.log("json", json);
				data.jsonIndex = json;
				cb();
			});
		},
		(cb) => {
			fetchMemberDetails(data.jsonIndex, (err, memberDetails) => {
				if (err) return cb(err);
				data.memberDetails = memberDetails;
				cb();
			});
		},
		(cb) => {
			fetchEqDetails(data.jsonIndex, (err, memberDetails) => {
				if (err) return cb(err);
				data.eqDetails = memberDetails;
				cb();
			});
		},
		(cb) => {
			fetchRsDetails(data.jsonIndex, (err, memberDetails) => {
				if (err) return cb(err);
				data.rsDetails = memberDetails;
				cb();
			});
		},
		(cb) => {
			checkDatabase((err, rows) => {
				data.rows = rows;
				if (err) return cb(err);
				cb();
			});
		},
		(cb) => {
			persistToDatabase(data, (err, rows) => {
				data.rows = rows;
				if (err) return cb(err);
				cb();
			});
		},
	];

	async.series(tasks, (err) => {
			if (err) {
				if (err.message !== 'Database already populated') {
					return res.json({status: 'error', msg: 'something went wrong', err});
				}
			}

			// console.log("eq details keys", Object.keys(data.eqDetails[0].members.length));
			// console.log("rs details keys", Object.keys(data.rsDetails[0].members.length));
			// console.log("eq details keys", data.eqDetails[0].members.length);
			// console.log("rs details keys", data.rsDetails[0].members.length);
			// console.log("members count", data.memberDetails.length);
			console.log("members count", data.rows.length);
		
			// formatting bday string
			// let yearMonthDay = "19850420".match(/^([0-9]{4})([0-9]{2})([0-9]{2})$/).slice(1,4).map(numStr => parseInt(numStr));
			// yearMonthDay[1] -= 1;
			// console.log("moment, 19850420", moment(yearMonthDay).format('D MMM YYYY'));

			res.json(data);
	});
}

const checkDatabase = (callback) => {
	db.table("members").select()
	.asCallback((err, rows) => {
		if (rows.length > 0) return callback(new Error("Database already populated"), rows);
		callback(err, rows);
	});
};

const persistToDatabase = (data, callback) => {
	const allAdults = [
		...(data.eqDetails[0].members.map(fields => ({...fields, group: 'eq'}))), 
		...(data.rsDetails[0].members.map(fields => ({...fields, group: 'rs'})))
	];

	// const stream = fs.createWriteStream('/Users/dcvezzani/projects/v1-eq/be/data/asdf.json'); // {flags:'a'}
	// stream.write(JSON.stringify(allAdults));
	// stream.end();
	
	// console.log("all adults", allAdults.slice(0,1));
	// return callback();

	const count = allAdults.length - 1;
	// console.log("all adults", allAdults.length);
	// return callback();

	allAdults.forEach((member, index) => {
		db('members')
		.insert(member)
		.asCallback((err, rows) => {
			if (err) return callback(err);
			console.log(`inserted ${index}`, member.name);

			if (index >= count) return callback(null, allAdults);
		});	
	});
}

const parseDirListing = (json, callback) => {
	let jsonIndex = null;
	try {
		jq.run('. | map({coupleName, headOfHouseIndividualId})', json, { input: 'json', output: 'json' }).then((res) => {
			jsonIndex = res;
			return callback(null, jsonIndex);
		});
	} catch(err) {
		return callback(err);
	}
};

const fetchRsDetails = (membersIndex, callback) => {
	console.log(`fetchRsDetails`);
	fs.exists(V1_DIR_RS_LISTING_CACHE, (exists) => {
		if (exists) {
			console.log("Cached file detected; reading file (rs details)...", V1_DIR_RS_LISTING_CACHE);
			fs.readFile(V1_DIR_RS_LISTING_CACHE, (err, data) => {
				if(err) return callback(new Error("Unable to read file (rs details)"));
				callback(err, JSON.parse(data));
			});
			
		} else {
			const cmd = dirRsListingCmd();
			console.log(`cmd`, cmd.slice(0,255) + '...');

			exec(cmd, {maxBuffer : 500 * 1024}, (err, stdout, stderr) => {
				const stream = fs.createWriteStream(V1_DIR_RS_LISTING_CACHE, {flags:'a'});
				if(err) return callback(new Error("Unable to fetch rs details"));
				stream.write(stdout);
				stream.end();

				callback(err, JSON.parse(stdout));
			});
		}
	});
};

const fetchEqDetails = (membersIndex, callback) => {
	fs.exists(V1_DIR_EQ_LISTING_CACHE, (exists) => {
		if (exists) {
			console.log("Cached file detected; reading file (eq details)...", V1_DIR_EQ_LISTING_CACHE);
			fs.readFile(V1_DIR_EQ_LISTING_CACHE, (err, data) => {
				if(err) return callback(new Error("Unable to read file (eq details)"));
				callback(err, JSON.parse(data));
			});
			
		} else {
			const stream = fs.createWriteStream(V1_DIR_EQ_LISTING_CACHE, {flags:'a'});
			
			// {maxBuffer : 500 * 1024}
			const cmd = dirEqListingCmd();
			console.log(`cmd`, cmd.slice(0,255) + '...');
			exec(cmd, {maxBuffer : 500 * 1024}, (err, stdout, stderr) => {
				if(err) return callback(new Error("Unable to fetch eq details"));
				stream.write(stdout);
				stream.end();

				callback(err, JSON.parse(stdout));
			});
		}
	});
};

const fetchMemberDetails = (membersIndex, callback) => {
	fs.exists(V1_MEMBER_DETAILS_CACHE, (exists) => {
		if (exists) {
			console.log("Cached file detected; reading file (member details)...");
			fs.readFile(V1_MEMBER_DETAILS_CACHE, (err, data) => {
				if(err) return callback(new Error("Unable to read file (member details)"));
				callback(err, JSON.parse(data));
			});
			
		} else {
			const stream = fs.createWriteStream(V1_MEMBER_DETAILS_CACHE, {flags:'a'});
			stream.write('[');
			
			// {maxBuffer : 500 * 1024}
			const tasks = membersIndex.map((member, index) => {
				const cmd = dirMemberDetailsCmd(member.headOfHouseIndividualId);
				return (cb) => setTimeout(() => {
					console.log(`index: ${index}`, cmd.slice(0,255) + '...');
					exec(cmd, (err, stdout, stderr) => {
						if(err) return cb(new Error("Unable to fetch member details"));
						if (index !== 0) {
							stream.write(',');
						}
						stream.write(stdout);
						
						cb();
					});
				}, 1000);
			});

			async.series(tasks, (err) => {
				if (err) return callback(err);

				stream.write(']');
				stream.end();

				fs.readFile(V1_MEMBER_DETAILS_CACHE, (err, data) => {
					if(err) return callback(new Error("Unable to read file (member details)"));
					callback(err, JSON.parse(data));
				});
			});
		}
	});
};

const fetchDirListing = (callback) => {
		fs.exists(V1_DIR_LISTING_CACHE, (exists) => {
			if (exists) {
				console.log("Cached file detected; reading file...");
				fs.readFile(V1_DIR_LISTING_CACHE, (err, data) => {
					if(err) return callback(new Error("Unable to read file"));
					callback(err, JSON.parse(data.toString()));
				});
				
			} else {
				exec(dirListingCmd(), {maxBuffer : 500 * 1024}, (err, stdout, stderr) => {
					fs.writeFile(V1_DIR_LISTING_CACHE, stdout, function(err) {
						if(err) return callback(new Error("Unable to cache json"));
						// callback(err, stdout);
						callback(err, JSON.parse(stdout));
					}); 
				});
			}
  });
};


// curl 'https://www.lds.org/mls/mbr/services/orgs/sub-orgs-with-callings?lang=eng&subOrgId=5873015' -H 'pragma: no-cache' -H $'cookie: cr-aths=shown; JSESSIONID=0; audience_split=66; aam_uuid=59021978805140378433128153389350885285; disable-footnotes=true; audience_id=501805; ldsorg_profile=%7B%22lastUser%22%3A%223694966261%22%2C%22users%22%3A%7B%223694966261%22%3A%7B%22nbIntro%22%3A0%2C%22nbMode%22%3A1%2C%22nbToolbar%22%3A1%2C%22nbColor%22%3A%22hl-color-1%22%2C%22nbFolder%22%3Anull%2C%22editId%22%3Anull%2C%22nbView%22%3A1%7D%7D%7D; _CT_RS_=Recording; WRUID=1734156077318192; lds-preferred-lang=eng; aam_sc=aamsc%3D708195%7C855179; check=true; AMCVS_66C5485451E56AAE0A490D45%40AdobeOrg=1; s_cc=true; audience_s_split=1; __CT_Data=gpv=9&ckp=tld&dm=lds.org&apv_59_www11=9&cpv_59_www11=9&rpv_59_www11=9; amlbcookie=75; ctm={\'pgv\':1842931537302687|\'vst\':3715575137017825|\'vstr\':6736419646463608|\'intr\':1527972825365|\'v\':1|\'lvst\':3991}; __VCAP_ID__=ccdac946-2859-4c6e-6584-073b; s_ppvl=https%253A%2F%2Fwww.lds.org%2Fdirectory%2F%253Flang%253Deng%2523%2C98%2C57%2C718%2C1264%2C718%2C1440%2C900%2C2%2CL; TS01b89640=01999b702375b7757d46f39b58e8ce4d837420ea91a7af50a3b51fd26af20757c80df593afce15ac6da5df43621780fe8fdb72c9d3de30682b06ab3b09ad5dbdc50825209b; lds-id=AQIC5wM2LY4Sfczv-AUcdeOuPU1mEy86tC3TxwxtHa3igJs.*AAJTSQACMDIAAlNLABQtNDgyMzE1NDk5MjExOTk0ODgwMAACUzEAAjA1*; AMCV_66C5485451E56AAE0A490D45%40AdobeOrg=1099438348%7CMCIDTS%7C17687%7CMCMID%7C58906328506240852853115932400075023059%7CMCAAMLH-1528340008%7C9%7CMCAAMB-1528694169%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1528096569s%7CNONE%7CMCAID%7CNONE%7CMCSYNCSOP%7C411-17690%7CvVersion%7C2.1.0; s_ppv=https%253A%2F%2Fwww.lds.org%2Fdirectory%2F%253Flang%253Deng%2523x%2C98%2C98%2C1159%2C1264%2C718%2C1440%2C900%2C2%2CL; mbox=PC#fa0bff93ae4543ce8c4dcc46ddc4b1e7.17_15#1591019666|session#6110d8e4693d4cd18f965502d5005bb5#1528091596; utag_main=v_id:01613d1c695300571a5f4e0e1ad00407900470710093c$_sn:49$_ss:0$_st:1528091541466$vapi_domain:lds.org$dc_visit:45$ses_id:1528089370354%3Bexp-session$_pn:2%3Bexp-session$dc_event:4%3Bexp-session$dc_region:us-east-1%3Bexp-session; s_sq=ldsall%3D%2526pid%253Dhttps%25253A%25252F%25252Fwww.lds.org%25252Fmls%25252Fmbr%25252F%25253Flang%25253Deng%2526oid%253Dhttps%25253A%25252F%25252Fwww.lds.org%25252Fmls%25252Fmbr%25252F%2526ot%253DA; ObSSOCookie=ewcXeEmLJi9vFloO7mKr4O62oKFiOVGV9RoU1odTA9IIrS4hqRTKaeHv6t%2BtI%2B3X2bvse%2F9N%2FCS53EnjYIH9QtLWPQoRgqWeuPI%2FRWdJ1wqbFc3%2BIEu48GLKwkymqKjzUOJJfGunOfJLIMciY7QvYYVTLAkStpK8uLAhmXuOM5qOMkzeZ%2FCpPLVO42Tn4C4TMDMWdIk4uZc%2FmM3PeiZ6vtw6EU2IFvuQ6qdsrK5sRQ5N5BkYK0wjgPU1c5MZsT3P5ibT69AooAxX1wD7rA77cni2TyVY3nquTlCJlOY0%2FoVGmQkxfFhEkSRrHJ7ot2GQ87eZXV4rn3GAoVdPvlTkpyvO7vD99XNNiNo1ov9d0z8%3D; t_ppv=undefined%2C70%2C9%2C718%2C122541; ADRUM_BTa=R:0|g:b78e9e4b-6f64-479f-a876-962c8549d393|n:customer1_acb14d98-cf8b-4f6d-8860-1c1af7831070; ADRUM_BT1=R:0|i:14680|e:191' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36' -H 'accept: application/json, text/plain, */*' -H 'cache-control: no-cache' -H 'authority: www.lds.org' -H 'referer: https://www.lds.org/mls/mbr/orgs/5873015?lang=eng&members' --compressed

