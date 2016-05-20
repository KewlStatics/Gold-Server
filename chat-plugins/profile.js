/* Profile chat-plugin
 * by jd, modified by panpawn
 */
 'use strict';

const serverIp = '167.114.155.242';
const http = require('http');
const formatHex = '#566'; //hex code for the formatting of the command
const geoip = require('geoip-ultralight');
const moment = require('moment');
geoip.startWatchingDataUpdate();

exports.commands = {
	profile: function(target, room, user) {
		if (!target) target = user.name;
		if (toId(target).length > 19) return this.sendReply("Usernames may not be more than 19 characters long.");
		if (toId(target).length < 1) return this.sendReply(target + " is not a valid username.");
		if (!this.runBroadcast()) return;

		let targetUser = Users.get(target);

		let username = (targetUser ? targetUser.name : target);
		let userid = (targetUser ? targetUser.userid : toId(target));
		let avatar = (targetUser ? (isNaN(targetUser.avatar) ? "http://" + serverIp + ":" + Config.port + "/avatars/" + targetUser.avatar : "http://play.pokemonshowdown.com/sprites/trainers/" + targetUser.avatar + ".png") : (Config.customavatars[userid] ? "http://" + serverIp + ":" + Config.port + "/avatars/" + Config.customavatars[userid] : "http://play.pokemonshowdown.com/sprites/trainers/167.png"));
		let online = (targetUser ? targetUser.connected : false);

		let userSymbol = (Users.usergroups[userid] ? Users.usergroups[userid].substr(0, 1) : "Regular User");
		let userGroup = (Config.groups[userSymbol] ? Config.groups[userSymbol].name : "Regular User");

		let self = this;
		let bucks = function (user) {
			user = toId(user);
			return (Economy.readMoneySync(user) ? Economy.readMoneySync(user) : 0);
		};
		let regdate = "(Unregistered)";
		Gold.regdate(userid, (date) => {
			if (date) {
				regdate = moment(date).format("MMMM DD, YYYY");
			}
			showProfile();
		});

		function getFlag (flagee) {
			if (!Users(flagee)) return false;
			let geo = geoip.lookupCountry(Users(flagee).latestIp);
			return (Users(flagee) && geo ? ' <img src="https://github.com/kevogod/cachechu/blob/master/flags/' + geo.toLowerCase() + '.png?raw=true" height=10 title="' + geo + '">' : false);
		}
		function lastActive (user) {
			if (!Users(user)) return false;
			user = Users(user);
			return (user && user.lastActive ? moment(user.lastActive).fromNow() : "hasn't talked yet");
		}
		function showProfile() {
			let seenOutput = (Gold.seenData[userid] ? moment(Gold.seenData[userid]).format("MMMM DD, YYYY h:mm A") + ' EST (' + moment(Gold.seenData[userid]).fromNow() + ')' : "Never");
			let profile = '';
			profile += '<img src="' + avatar + '" height=80 width=80 align=left>';
			if (!getFlag(toId(username))) profile += '&nbsp;<font color=' + formatHex + '><b>Name:</b></font> <strong class="username">' + Gold.nameColor(username, false) + '</strong><br />';
			if (getFlag(toId(username))) profile += '&nbsp;<font color=' + formatHex + '><b>Name:</b></font> <strong class="username">' + Gold.nameColor(username, false) + '</strong>' + getFlag(toId(username)) + '<br />';
			profile += '&nbsp;<font color=' + formatHex + '><b>Registered:</b></font> ' + regdate + '<br />';
			if (!Gold.hasBadge(userid,'vip')) profile += '&nbsp;<font color=' + formatHex + '><b>Rank:</b></font> ' + userGroup + '<br />';
			if (Gold.hasBadge(userid,'vip')) profile += '&nbsp;<font color=' + formatHex + '><b>Rank:</b></font> ' + userGroup + ' (<font color=#6390F0><b>VIP User</b></font>)<br />';
			profile += '&nbsp;<font color=' + formatHex + '><b>Bucks: </font></b>' + bucks(username) + '<br />';
			if (online && lastActive(toId(username))) profile += '&nbsp;<font color=' + formatHex + '><b>Last Active:</b></font> ' + lastActive(toId(username)) + '<br />';
			if (!online) profile += '&nbsp;<font color=' + formatHex + '><b>Last Online: </font></b>' + seenOutput + '<br />';
			profile += '<br clear="all">';
			self.sendReplyBox(profile);
			room.update();
		}
	},
};
