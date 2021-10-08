(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{106:function(t,e,o){"use strict";var n=o(40),r=Object(n.a)({props:{error:{type:Object,default:null}},setup:function(t,e){return{pageNotFound:"404 Not Found",otherError:"An error occurred"}},head:function(){return{title:404===this.error.statusCode?this.pageNotFound:this.otherError}}}),c=(o(380),o(116)),l=o(156),v=o.n(l),d=o(506),component=Object(c.a)(r,(function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("v-app",{attrs:{dark:""}},[404===t.error.statusCode?o("h1",[t._v("\n    "+t._s(t.pageNotFound)+"\n  ")]):o("div",[o("Nuxt")],1)])}),[],!1,null,"3dd07a50",null);e.a=component.exports;v()(component,{VApp:d.a})},228:function(t,e,o){"use strict";var n=o(192);n.a.apps.length||n.a.initializeApp({apiKey:"AIzaSyBmzgqc36LEqKiJt4pO-3U8ayj3hUuJ3Y4",authDomain:"kintai-4b623.firebaseapp.com",databaseURL:"https://kintai-4b623.firebaseio.com",projectId:"kintai-4b623",storageBucket:"kintai-4b623.appspot.com",messagingSenderId:"590143987084",appId:"1:590143987084:web:1e66847a94d157b4704aa9",measurementId:"G-WKWH74V5WR"}),e.a=n.a},229:function(t,e,o){"use strict";var n=o(311);e.a=function(t){var e=t.store;Object(n.a)({key:"Vuex",paths:["project","dark"]})(e)}},286:function(t,e,o){var content=o(381);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,o(20).default)("73037472",content,!0,{sourceMap:!1})},313:function(t,e,o){"use strict";o(14),o(10),o(13),o(16),o(17);var n=o(4),r=(o(12),o(40)),c=o(133);function l(object,t){var e=Object.keys(object);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(object);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(object,t).enumerable}))),e.push.apply(e,o)}return e}function v(t){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?l(Object(source),!0).forEach((function(e){Object(n.a)(t,e,source[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(source)):l(Object(source)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(source,e))}))}return t}var d=Object(r.a)({setup:function(t,e){var o=Object(r.d)(!1),n=Object(r.d)(!1),l=Object(r.d)([]),d=Object(r.d)({}),m=Object(r.d)(null),f=Object(r.f)(),h=Object(r.d)(!0),j=Object(r.d)("dark_mode"),_=Object(r.d)(!0),O=Object(r.d)(!0),w=function(){window.innerWidth<1264?O.value=!1:(O.value=!0,o.value=!0)};return Object(r.c)((function(){h.value=f.state.dark,d.value=f.state.project,c.a.auth().onAuthStateChanged((function(data){data?(n.value=!0,m.value=c.a.auth().currentUser,console.log(m.value),c.a.firestore().collection("users/".concat(m.value.uid,"/projects")).get().then((function(t){t.forEach((function(t){l.value.push(v(v({},t.data()),{},{id:t.id}))}))}))):m.value={}})),w(),window.onresize=function(){w()}})),Object(r.g)((function(){return h.value}),(function(t,o){e.root.$vuetify.theme.dark=h.value,j.value=t?"dark_mode":"light_mode",f.dispatch("writeDark",t)})),Object(r.g)((function(){return e.root.$route.path}),(function(t,e){_.value="/settings"!==t})),{drawer:o,fixed:!1,isLogoutItems:[{icon:"login",title:"ログイン",to:"/login"},{icon:"person",title:"会員登録",to:"/signup"}],isLoginItems:[{icon:"timer",title:"出退勤入力",to:"/input"},{icon:"event_note",title:"カレンダー",to:"/calendar"},{icon:"view_list",title:"プロジェクト",to:"/projects"}],title:"Vuetify.js",isSignedIn:n,selectedProject:d,projects:l,currentUser:m,onChangeProject:function(t){f.dispatch("writeProject",t)},store:f,theme:h,themeIcon:j,signOut:function(){c.a.auth().signOut().then((function(){console.log("ログアウトしました"),location.href="/login"})).catch((function(t){console.log("ログアウト失敗",t)}))},isShowSelectedProject:_,isPC:O}}}),m=o(116),f=o(156),h=o.n(f),j=o(506),_=o(514),O=o(507),w=o(508),k=o(509),x=o(221),P=o(222),y=o(151),I=o(223),V=o(90),S=o(510),C=o(513),D=o(512),L=o(511),F=o(515),A=o(309),component=Object(m.a)(d,(function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("v-app",{attrs:{dark:""}},[o("v-navigation-drawer",{attrs:{fixed:"",app:"",width:"320"},model:{value:t.drawer,callback:function(e){t.drawer=e},expression:"drawer"}},[t.isSignedIn?o("v-list",[o("v-list-item",[o("v-list-item-action",[o("v-icon",[t._v("account_circle")])],1),t._v(" "),o("v-list-item-content",[o("v-list-item-title",[t._v(t._s(t.currentUser.email))])],1)],1),t._v(" "),t._l(t.isLoginItems,(function(e,i){return o("v-list-item",{key:i,attrs:{to:e.to,router:"",exact:""}},[o("v-list-item-action",[o("v-icon",[t._v(t._s(e.icon))])],1),t._v(" "),o("v-list-item-content",[o("v-list-item-title",{domProps:{textContent:t._s(e.title)}})],1)],1)})),t._v(" "),o("v-list-item",{attrs:{to:"/settings",router:"",exact:""}},[o("v-list-item-action",[o("v-icon",[t._v("settings")])],1),t._v(" "),o("v-list-item-content",[o("v-list-item-title",[t._v("設定")])],1)],1),t._v(" "),o("v-list-item",{attrs:{exact:""},on:{click:t.signOut}},[o("v-list-item-action",[o("v-icon",[t._v("logout")])],1),t._v(" "),o("v-list-item-content",[o("v-list-item-title",[t._v("ログアウト")])],1)],1),t._v(" "),o("v-list-item",[o("v-list-item-content",[o("v-switch",{attrs:{"prepend-icon":t.themeIcon},model:{value:t.theme,callback:function(e){t.theme=e},expression:"theme"}})],1)],1)],2):o("v-list",[t._l(t.isLogoutItems,(function(e,i){return o("v-list-item",{key:i,attrs:{to:e.to,router:"",exact:""}},[o("v-list-item-action",[o("v-icon",[t._v(t._s(e.icon))])],1),t._v(" "),o("v-list-item-content",[o("v-list-item-title",{domProps:{textContent:t._s(e.title)}})],1)],1)})),t._v(" "),o("v-list-item",[o("v-list-item-content",[o("v-switch",{attrs:{"prepend-icon":t.themeIcon},model:{value:t.theme,callback:function(e){t.theme=e},expression:"theme"}})],1)],1)],2)],1),t._v(" "),o("v-app-bar",{attrs:{fixed:"",app:""}},[t.isPC?t._e():o("v-app-bar-nav-icon",{on:{click:function(e){e.stopPropagation(),t.drawer=!t.drawer}}}),t._v(" "),o("v-toolbar-title",{domProps:{textContent:t._s(t.title)}}),t._v(" "),o("v-spacer")],1),t._v(" "),o("v-main",[o("v-container",[t.isSignedIn&&t.isShowSelectedProject?o("v-select",{attrs:{items:t.projects,filled:"",label:"Select project","item-text":"name","item-value":"id","return-object":""},on:{change:t.onChangeProject},model:{value:t.selectedProject,callback:function(e){t.selectedProject=e},expression:"selectedProject"}}):t._e(),t._v(" "),o("hr"),t._v(" "),o("Nuxt")],1)],1),t._v(" "),o("v-footer",{attrs:{absolute:!t.fixed,app:""}},[o("span",[t._v("© "+t._s((new Date).getFullYear()))])])],1)}),[],!1,null,null,null);e.a=component.exports;h()(component,{VApp:j.a,VAppBar:_.a,VAppBarNavIcon:O.a,VContainer:w.a,VFooter:k.a,VIcon:x.a,VList:P.a,VListItem:y.a,VListItemAction:I.a,VListItemContent:V.a,VListItemTitle:V.b,VMain:S.a,VNavigationDrawer:C.a,VSelect:D.a,VSpacer:L.a,VSwitch:F.a,VToolbarTitle:A.a})},324:function(t,e,o){o(325),o(326),t.exports=o(341)},380:function(t,e,o){"use strict";o(286)},381:function(t,e,o){var n=o(19)(!1);n.push([t.i,"h1[data-v-3dd07a50]{font-size:20px}",""]),t.exports=n},476:function(t,e,o){"use strict";o.r(e),o.d(e,"state",(function(){return n})),o.d(e,"mutations",(function(){return r})),o.d(e,"actions",(function(){return c}));var n=function(){return{project:"",dark:!0}},r={setProjectFromStore:function(t,e){t.project=e},setDarkFromStore:function(t,e){t.dark=e}},c={writeProject:function(t,e){console.log("context"),console.log(t),console.log("value"),console.log(e),t.commit("setProjectFromStore",e)},writeDark:function(t,e){console.log("context"),console.log(t),console.log("value"),console.log(e),t.commit("setDarkFromStore",e)}}}},[[324,24,5,25]]]);