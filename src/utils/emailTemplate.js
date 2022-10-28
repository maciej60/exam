require("dotenv").config();

const emailHeader = `
<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!--[if IE]><html xmlns="http://www.w3.org/1999/xhtml" class="ie"><![endif]-->
<!--[if !IE]><!--><html xmlns="http://www.w3.org/1999/xhtml"><!--<![endif]-->
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge" /><!--<![endif]-->
    <meta name="viewport" content="width=device-width" /><style type="text/css" emb-not-inline>
@media only screen and (min-width: 620px){.wrapper{min-width:600px !important}.wrapper h1{}.wrapper h1{font-size:26px !important;line-height:34px !important}.wrapper h2{}.wrapper h2{font-size:20px !important;line-height:28px !important}.wrapper h3{}.column{}.wrapper .size-8{font-size:8px !important;line-height:14px !important}.wrapper .size-9{font-size:9px !important;line-height:16px !important}.wrapper .size-10{font-size:10px !important;line-height:18px !important}.wrapper .size-11{font-size:11px !important;line-height:19px !important}.wrapper .size-12{font-size:12px !important;line-height:19px !important}.wrapper .size-13{font-size:13px !important;line-height:21px !important}.wrapper .size-14{font-size:14px !important;line-height:21px !important}.wrapper .size-15{font-size:15px !important;line-height:23px !important}.wrapper .size-16{font-size:16px !important;line-height:24px !important}.wrapper .size-17{font-size:17px !important;line-height:26px !important}.wrapper .size-18{font-size:18px !important;line-height:26px !important}.wrapper .size-20{font-size:20px !important;line-height:28px !important}.wrapper .size-22{font-size:22px !important;line-height:31px !important}.wrapper .size-24{font-size:24px !important;line-height:32px !important}.wrapper .size-26{font-size:26px !important;line-height:34px !important}.wrapper .size-28{font-size:28px !important;line-height:36px !important}.wrapper .size-30{font-size:30px !important;line-height:38px !important}.wrapper .size-32{font-size:32px !important;line-height:40px !important}.wrapper .size-34{font-size:34px !important;line-height:43px !important}.wrapper .size-36{font-size:36px !important;line-height:43px !important}.wrapper .size-40{font-size:40px !important;line-height:47px !important}.wrapper .size-44{font-size:44px !important;line-height:50px !important}.wrapper .size-48{font-size:48px !important;line-height:54px !important}.wrapper .size-56{font-size:56px !important;line-height:60px !important}.wrapper .size-64{font-size:64px !important;line-height:63px !important}}
</style>
    <meta name="x-apple-disable-message-reformatting" />
    <style type="text/css" emb-not-inline>
.main, .mso {
  margin: 0;
  padding: 0;
}
table {
  border-collapse: collapse;
  table-layout: fixed;
}
* {
  line-height: inherit;
}
[x-apple-data-detectors] {
  color: inherit !important;
  text-decoration: none !important;
}
.wrapper .footer__share-button a:hover,
.wrapper .footer__share-button a:focus {
  color: #ffffff !important;
}
.wrapper .footer__share-button a.icon-white:hover,
.wrapper .footer__share-button a.icon-white:focus {
  color: #ffffff !important;
}
.wrapper .footer__share-button a.icon-black:hover,
.wrapper .footer__share-button a.icon-black:focus {
  color: #000000 !important;
}
.btn a:hover,
.btn a:focus,
.footer__share-button a:hover,
.footer__share-button a:focus,
.email-footer__links a:hover,
.email-footer__links a:focus {
  opacity: 0.8;
}
.preheader,
.header,
.layout,
.column {
  transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out;
}
.preheader td {
  padding-bottom: 8px;
}
.layout,
div.header {
  max-width: 400px !important;
  -fallback-width: 95% !important;
  width: calc(100% - 20px) !important;
}
div.preheader {
  max-width: 360px !important;
  -fallback-width: 90% !important;
  width: calc(100% - 60px) !important;
}
.snippet,
.webversion {
  Float: none !important;
}
.stack .column {
  max-width: 400px !important;
  width: 100% !important;
}
.fixed-width.has-border {
  max-width: 402px !important;
}
.fixed-width.has-border .layout__inner {
  box-sizing: border-box;
}
.snippet,
.webversion {
  width: 50% !important;
}
.ie .btn {
  width: 100%;
}
.ie .stack .column,
.ie .stack .gutter {
  display: table-cell;
  float: none !important;
}
.ie div.preheader,
.ie .email-footer {
  max-width: 560px !important;
  width: 560px !important;
}
.ie .snippet,
.ie .webversion {
  width: 280px !important;
}
.ie div.header,
.ie .layout {
  max-width: 600px !important;
  width: 600px !important;
}
.ie .two-col .column {
  max-width: 300px !important;
  width: 300px !important;
}
.ie .three-col .column,
.ie .narrow {
  max-width: 200px !important;
  width: 200px !important;
}
.ie .wide {
  width: 400px !important;
}
.ie .stack.fixed-width.has-border,
.ie .stack.has-gutter.has-border {
  max-width: 602px !important;
  width: 602px !important;
}
.ie .stack.two-col.has-gutter .column {
  max-width: 290px !important;
  width: 290px !important;
}
.ie .stack.three-col.has-gutter .column,
.ie .stack.has-gutter .narrow {
  max-width: 188px !important;
  width: 188px !important;
}
.ie .stack.has-gutter .wide {
  max-width: 394px !important;
  width: 394px !important;
}
.ie .stack.two-col.has-gutter.has-border .column {
  max-width: 292px !important;
  width: 292px !important;
}
.ie .stack.three-col.has-gutter.has-border .column,
.ie .stack.has-gutter.has-border .narrow {
  max-width: 190px !important;
  width: 190px !important;
}
.ie .stack.has-gutter.has-border .wide {
  max-width: 396px !important;
  width: 396px !important;
}
.ie .fixed-width .layout__inner {
  border-left: 0 none white !important;
  border-right: 0 none white !important;
}
.ie .layout__edges {
  display: none;
}
.mso .layout__edges {
  font-size: 0;
}
.layout-fixed-width,
.mso .layout-full-width {
  background-color: #ffffff;
}
@media only screen and (min-width: 620px) {
  .column,
  .gutter {
    display: table-cell;
    Float: none !important;
    vertical-align: top;
  }
  div.preheader,
  .email-footer {
    max-width: 560px !important;
    width: 560px !important;
  }
  .snippet,
  .webversion {
    width: 280px !important;
  }
  div.header,
  .layout,
  .one-col .column {
    max-width: 600px !important;
    width: 600px !important;
  }
  .fixed-width.has-border,
  .fixed-width.x_has-border,
  .has-gutter.has-border,
  .has-gutter.x_has-border {
    max-width: 602px !important;
    width: 602px !important;
  }
  .two-col .column {
    max-width: 300px !important;
    width: 300px !important;
  }
  .three-col .column,
  .column.narrow,
  .column.x_narrow {
    max-width: 200px !important;
    width: 200px !important;
  }
  .column.wide,
  .column.x_wide {
    width: 400px !important;
  }
  .two-col.has-gutter .column,
  .two-col.x_has-gutter .column {
    max-width: 290px !important;
    width: 290px !important;
  }
  .three-col.has-gutter .column,
  .three-col.x_has-gutter .column,
  .has-gutter .narrow {
    max-width: 188px !important;
    width: 188px !important;
  }
  .has-gutter .wide {
    max-width: 394px !important;
    width: 394px !important;
  }
  .two-col.has-gutter.has-border .column,
  .two-col.x_has-gutter.x_has-border .column {
    max-width: 292px !important;
    width: 292px !important;
  }
  .three-col.has-gutter.has-border .column,
  .three-col.x_has-gutter.x_has-border .column,
  .has-gutter.has-border .narrow,
  .has-gutter.x_has-border .narrow {
    max-width: 190px !important;
    width: 190px !important;
  }
  .has-gutter.has-border .wide,
  .has-gutter.x_has-border .wide {
    max-width: 396px !important;
    width: 396px !important;
  }
}
@supports (display: flex) {
  @media only screen and (min-width: 620px) {
    .fixed-width.has-border .layout__inner {
      display: flex !important;
    }
  }
}
/***
* Mobile Styles
*
* 1. Overriding inline styles
*/
@media(max-width: 619px) {
  .email-flexible-footer .left-aligned-footer .column,
  .email-flexible-footer .center-aligned-footer,
  .email-flexible-footer .right-aligned-footer .column {
    max-width: 100% !important; /* [1] */
    text-align: center !important; /* [1] */
    width: 100% !important; /* [1] */
  }
  .flexible-footer-logo {
    margin-left: 0px !important; /* [1] */
    margin-right: 0px !important; /* [1] */
  }
  .email-flexible-footer .left-aligned-footer .flexible-footer__share-button__container,
  .email-flexible-footer .center-aligned-footer .flexible-footer__share-button__container,
  .email-flexible-footer .right-aligned-footer .flexible-footer__share-button__container {
    display: inline-block;
    margin-left: 5px !important; /* [1] */
    margin-right: 5px !important; /* [1] */
  }
  .email-flexible-footer__additionalinfo--center {
    text-align: center !important; /* [1] */
  }
  
  .email-flexible-footer .left-aligned-footer table,
  .email-flexible-footer .center-aligned-footer table,
  .email-flexible-footer .right-aligned-footer table {
    display: table !important; /* [1] */
    width: 100% !important; /* [1] */
  }
  .email-flexible-footer .footer__share-button,
  .email-flexible-footer .email-footer__additional-info {
    margin-left: 20px;
    margin-right: 20px;
  }
}
@media only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx) {
  .fblike {
    background-image: url(https://i7.createsend1.com/static/eb/master/13-the-blueprint-3/images/fblike@2x.png) !important;
  }
  .tweet {
    background-image: url(https://i8.createsend1.com/static/eb/master/13-the-blueprint-3/images/tweet@2x.png) !important;
  }
  .linkedinshare {
    background-image: url(https://i9.createsend1.com/static/eb/master/13-the-blueprint-3/images/lishare@2x.png) !important;
  }
  .forwardtoafriend {
    background-image: url(https://i10.createsend1.com/static/eb/master/13-the-blueprint-3/images/forward@2x.png) !important;
  }
}
@media (max-width: 321px) {
  .fixed-width.has-border .layout__inner {
    border-width: 1px 0 !important;
  }
  .layout,
  .stack .column {
    min-width: 320px !important;
    width: 320px !important;
  }
  .border {
    display: none;
  }
  .has-gutter .border {
    display: table-cell;
  }
}
.mso div {
  border: 0 none white !important;
}
.mso .w560 .divider {
  Margin-left: 260px !important;
  Margin-right: 260px !important;
}
.mso .w360 .divider {
  Margin-left: 160px !important;
  Margin-right: 160px !important;
}
.mso .w260 .divider {
  Margin-left: 110px !important;
  Margin-right: 110px !important;
}
.mso .w160 .divider {
  Margin-left: 60px !important;
  Margin-right: 60px !important;
}
.mso .w354 .divider {
  Margin-left: 157px !important;
  Margin-right: 157px !important;
}
.mso .w250 .divider {
  Margin-left: 105px !important;
  Margin-right: 105px !important;
}
.mso .w148 .divider {
  Margin-left: 54px !important;
  Margin-right: 54px !important;
}
.mso .size-8,
.ie .size-8 {
  font-size: 8px !important;
  line-height: 14px !important;
}
.mso .size-9,
.ie .size-9 {
  font-size: 9px !important;
  line-height: 16px !important;
}
.mso .size-10,
.ie .size-10 {
  font-size: 10px !important;
  line-height: 18px !important;
}
.mso .size-11,
.ie .size-11 {
  font-size: 11px !important;
  line-height: 19px !important;
}
.mso .size-12,
.ie .size-12 {
  font-size: 12px !important;
  line-height: 19px !important;
}
.mso .size-13,
.ie .size-13 {
  font-size: 13px !important;
  line-height: 21px !important;
}
.mso .size-14,
.ie .size-14 {
  font-size: 14px !important;
  line-height: 21px !important;
}
.mso .size-15,
.ie .size-15 {
  font-size: 15px !important;
  line-height: 23px !important;
}
.mso .size-16,
.ie .size-16 {
  font-size: 16px !important;
  line-height: 24px !important;
}
.mso .size-17,
.ie .size-17 {
  font-size: 17px !important;
  line-height: 26px !important;
}
.mso .size-18,
.ie .size-18 {
  font-size: 18px !important;
  line-height: 26px !important;
}
.mso .size-20,
.ie .size-20 {
  font-size: 20px !important;
  line-height: 28px !important;
}
.mso .size-22,
.ie .size-22 {
  font-size: 22px !important;
  line-height: 31px !important;
}
.mso .size-24,
.ie .size-24 {
  font-size: 24px !important;
  line-height: 32px !important;
}
.mso .size-26,
.ie .size-26 {
  font-size: 26px !important;
  line-height: 34px !important;
}
.mso .size-28,
.ie .size-28 {
  font-size: 28px !important;
  line-height: 36px !important;
}
.mso .size-30,
.ie .size-30 {
  font-size: 30px !important;
  line-height: 38px !important;
}
.mso .size-32,
.ie .size-32 {
  font-size: 32px !important;
  line-height: 40px !important;
}
.mso .size-34,
.ie .size-34 {
  font-size: 34px !important;
  line-height: 43px !important;
}
.mso .size-36,
.ie .size-36 {
  font-size: 36px !important;
  line-height: 43px !important;
}
.mso .size-40,
.ie .size-40 {
  font-size: 40px !important;
  line-height: 47px !important;
}
.mso .size-44,
.ie .size-44 {
  font-size: 44px !important;
  line-height: 50px !important;
}
.mso .size-48,
.ie .size-48 {
  font-size: 48px !important;
  line-height: 54px !important;
}
.mso .size-56,
.ie .size-56 {
  font-size: 56px !important;
  line-height: 60px !important;
}
.mso .size-64,
.ie .size-64 {
  font-size: 64px !important;
  line-height: 63px !important;
}
</style>
    <style type="text/css" emb-inline>
html {
  margin: 0;
  padding: 0;
}
.main, .mso {
  margin: 0;
  padding: 0;
  -webkit-text-size-adjust: 100%;
}
table {
  border-collapse: collapse;
  table-layout: fixed;
}
.wrapper {
  min-width: 320px;
  width: 100%;
}
.wrapper + img {
  overflow: hidden;
  position: fixed;
}
.wrapper img {
  border: 0;
}
.wrapper a {
  text-decoration: underline;
  transition: opacity 0.1s ease-in;
}
.wrapper h1 a,
.wrapper h2 a,
.wrapper h3 a {
  text-decoration: none;
}
.wrapper h1,
.wrapper h2,
.wrapper h3,
.wrapper p,
.wrapper ol,
.wrapper ul,
.wrapper li,
.wrapper blockquote {
  Margin-top: 0;
  Margin-bottom: 0;
}
.wrapper blockquote {
  Margin-left: 0;
  Margin-right: 0;
  padding-left: 14px;
}
.wrapper h1,
.wrapper h2,
.wrapper h3 {
  font-style: normal;
  font-weight: normal;
}
.wrapper h1 + *,
.wrapper h1 + * > li:first-child,
.wrapper h1 + blockquote :first-child {
  Margin-top: 20px;
}
.wrapper .email-flexible-footer__additionalinfo--inline h1 + *,
.wrapper .email-flexible-footer__additionalinfo--inline h1 + * > li:first-child,
.wrapper .email-flexible-footer__additionalinfo--inline h1 + blockquote :first-child {
  Margin-top: 0;
}
.wrapper h2 + *,
.wrapper h2 + * > li:first-child,
.wrapper h2 + blockquote :first-child {
  Margin-top: 16px;
}
.wrapper .email-flexible-footer__additionalinfo--inline h2 + *,
.wrapper .email-flexible-footer__additionalinfo--inline h2 + * > li:first-child,
.wrapper .email-flexible-footer__additionalinfo--inline h2 + blockquote :first-child {
  Margin-top: 0;
}
.wrapper h3 + *,
.wrapper h3 + * > li:first-child,
.wrapper h3 + blockquote :first-child {
  Margin-top: 12px;
}
.wrapper .email-flexible-footer__additionalinfo--inline h3 + *,
.wrapper .email-flexible-footer__additionalinfo--inline h3 + * > li:first-child,
.wrapper .email-flexible-footer__additionalinfo--inline h3 + blockquote :first-child {
  Margin-top: 0;
}
.wrapper ol,
.wrapper ul {
  Margin-left: 24px;
  padding: 0;
}
.wrapper ul {
  list-style-type: disc;
}
.wrapper ol {
  list-style-type: decimal;
}
.wrapper li {
  Margin-left: 0;
}
.wrapper p + *,
.wrapper ol + *,
.wrapper ul + *,
.wrapper blockquote + *,
.wrapper .image--inline + *,
.wrapper .video + *,
.wrapper .divider + *,
.wrapper .btn + *,
.wrapper .countdown--inline + *,
.wrapper .socialmedia--inline + *,
.wrapper p + * > li:first-child,
.wrapper ol + * > li:first-child,
.wrapper ul + * > li:first-child,
.wrapper blockquote + * > li:first-child,
.wrapper .image--inline + * > li:first-child,
.wrapper .video + * > li:first-child,
.wrapper .divider + * > li:first-child,
.wrapper .btn + * > li:first-child,
.wrapper .countdown--inline + * > li:first-child,
.wrapper .socialmedia--inline + * > li:first-child,
.wrapper p + blockquote :first-child,
.wrapper ol + blockquote :first-child,
.wrapper ul + blockquote :first-child,
.wrapper blockquote + blockquote :first-child,
.wrapper .image--inline + blockquote :first-child,
.wrapper .video + blockquote :first-child,
.wrapper .divider + blockquote :first-child,
.wrapper .btn + blockquote :first-child,
.wrapper .countdown--inline + blockquote :first-child,
.wrapper .socialmedia--inline + blockquote :first-child {
  Margin-top: 20px;
}
.wrapper .email-flexible-footer__additionalinfo--inline p + *,
.wrapper .email-flexible-footer__additionalinfo--inline ol + *,
.wrapper .email-flexible-footer__additionalinfo--inline ul + *,
.wrapper .email-flexible-footer__additionalinfo--inline blockquote + *,
.wrapper .email-flexible-footer__additionalinfo--inline p + * > li:first-child,
.wrapper .email-flexible-footer__additionalinfo--inline ol + * > li:first-child,
.wrapper .email-flexible-footer__additionalinfo--inline ul + * > li:first-child,
.wrapper .email-flexible-footer__additionalinfo--inline blockquote + * > li:first-child,
.wrapper .email-flexible-footer__additionalinfo--inline p + blockquote :first-child,
.wrapper .email-flexible-footer__additionalinfo--inline ol + blockquote :first-child,
.wrapper .email-flexible-footer__additionalinfo--inline ul + blockquote :first-child,
.wrapper .email-flexible-footer__additionalinfo--inline blockquote + blockquote :first-child {
  Margin-top: 0;
}
.text--inline {
  mso-line-height-rule: exactly;
  mso-text-raise: 11px;
  vertical-align: middle;
}
.size-8,
.size-9 {
  mso-text-raise: 9px;
}
.size-36,
.size-40 {
  mso-text-raise: 13px;
}
.size-44 {
  mso-text-raise: 15px;
}
.size-48 {
  mso-text-raise: 18px;
}
.size-56 {
  mso-text-raise: 20px;
}
.size-64 {
  mso-text-raise: 25px;
}
.column__padding--inline:nth-last-child(n+2) h1:last-child {
  Margin-bottom: 20px;
}
.column__padding--inline:nth-last-child(n+2) h2:last-child {
  Margin-bottom: 16px;
}
.column__padding--inline:nth-last-child(n+2) h3:last-child {
  Margin-bottom: 12px;
}
.column__padding--inline:nth-last-child(n+2) p:last-child,
.column__padding--inline:nth-last-child(n+2) ol:last-child,
.column__padding--inline:nth-last-child(n+2) ul:last-child,
.column__padding--inline:nth-last-child(n+2) blockquote:last-child,
.column__padding--inline:nth-last-child(n+2) .image--inline,
.column__padding--inline:nth-last-child(n+2) .video,
.column__padding--inline:nth-last-child(n+2) .divider,
.column__padding--inline:nth-last-child(n+2) .btn,
.column__padding--inline:nth-last-child(n+2) .countdown--inline {
  Margin-bottom: 20px;
}
.image--inline,
.video {
  font-size: 12px;
  font-style: normal;
  font-weight: normal;
  line-height: 19px;
}
.image--inline img,
.video img,
.countdown--inline img {
  display: block;
  height: auto;
  width: 100%;
}
.countdown--inline img {
  clear: both;
  max-height: 78px;
  max-width: 480px;
}
.countdown--inline img ~ img {
  max-height: 40px;
}
.btn a {
  border-radius: 3px;
  display: inline-block;
  font-size: 14px;
  font-weight: bold;
  line-height: 24px;
  padding: 12px 24px;
  text-align: center;
  text-decoration: none !important;
}
.btn--medium a {
  font-size: 12px;
  line-height: 22px;
  padding: 10px 20px;
}
.btn--small a {
  font-size: 11px;
  line-height: 19px;
  padding: 6px 12px;
}
.btn--shadow a {
  box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.2);
  padding: 12px 24px 13px 24px;
}
.btn--medium.btn--shadow a {
  padding: 10px 20px 11px 20px;
}
.btn--small.btn--shadow a {
  padding: 6px 12px 7px 12px;
}
.btn--depth a {
  border: 1px solid rgba(0, 0, 0, 0.25);
  box-shadow: inset 0 -3px 0 -1px rgba(0, 0, 0, 0.2), inset 0 2px 1px -1px #ffffff;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.21);
}
.divider {
  display: block;
  font-size: 2px;
  line-height: 2px;
  Margin-left: auto;
  Margin-right: auto;
  width: 40px;
}
.border {
  font-size: 0;
}
div.preheader {
  Margin: 0 auto;
  max-width: 560px;
  min-width: 280px;
  -fallback-width: 280px;
  width: calc(28000% - 167440px);
}
.header,
.email-footer {
  Margin: 0 auto;
  max-width: 600px;
  min-width: 320px;
  -fallback-width: 320px;
  width: calc(28000% - 167400px);
}
.logo,
.footer-logo {
  font-size: 26px;
  line-height: 32px;
  Margin-top: 10px;
  Margin-bottom: 20px;
}
.header--padded--inline .logo,
.header--padded--inline .footer-logo {
  Margin-left: 20px;
  Margin-right: 20px;
}
.wrapper .logo a,
.wrapper .footer-logo a {
  text-decoration: none;
}
.logo img,
.footer-logo img {
  display: block;
  height: auto;
  width: 100%;
}
.snippet {
  display: table-cell;
  Float: left;
  font-size: 12px;
  line-height: 19px;
  max-width: 280px;
  min-width: 140px;
  -fallback-width: 140px;
  width: calc(14000% - 78120px);
  padding: 10px 0 5px 0;
}
.webversion {
  display: table-cell;
  Float: left;
  font-size: 12px;
  line-height: 19px;
  max-width: 280px;
  min-width: 139px;
  -fallback-width: 139px;
  width: calc(14100% - 78680px);
  padding: 10px 0 5px 0;
}
.webversion {
  text-align: right;
}
.webversion .c-webversion-wrapper {
  display: inline-flex;
}
.layout {
  Margin: 0 auto;
  max-width: 600px;
  min-width: 320px;
  -fallback-width: 320px;
  width: calc(28000% - 167400px);
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}
.preheader__inner--inline,
.layout__inner {
  border-collapse: collapse;
  display: table;
  width: 100%;
}
.fixed-width .layout__inner,
.full-width--inline,
.has-gutter .column__background {
  background-color: #ffffff;
}
.fixed-width.has-border,
.has-gutter.has-border {
  max-width: 602px;
  min-width: 322px;
  -fallback-width: 322px;
  width: calc(28000% - 167398px);
}
.column__padding--inline {
  Margin-left: 20px;
  Margin-right: 20px;
}
.two-col.sidebyside--inline .column,
.three-col.sidebyside--inline .column,
.sidebar--inline.sidebyside--inline .column {
  display: table-cell;
  vertical-align: top;
}
.two-col.sidebyside--inline .column {
  width: 50%;
}
.three-col.sidebyside--inline .column,
.sidebar--inline.sidebyside--inline .column.narrow {
  width: 33.3%;
}
.sidebar--inline.sidebyside--inline .column.wide {
  width: 66.7%;
}
.two-col.has-gutter.sidebyside--inline .column {
  width: 48.3%;
}
.two-col.has-gutter.has-border.sidebyside--inline .column {
  width: 48.7%;
}
.three-col.has-gutter.sidebyside--inline .column,
.sidebar--inline.has-gutter.sidebyside--inline .column.narrow {
  width: 31.3%;
}
.three-col.has-gutter.has-border.sidebyside--inline .column,
.sidebar--inline.has-gutter.has-border.sidebyside--inline .column.narrow {
  width: 31.7%;
}
.sidebar--inline.has-gutter.sidebyside--inline .column.wide {
  width: 65.7%;
}
.sidebar--inline.has-gutter.has-border.sidebyside--inline .column.wide {
  width: 66%;
}
.stack.two-col .column {
  max-width: 320px;
  min-width: 300px;
  -fallback-width: 320px;
  width: calc(12300px - 2000%);
}
.stack.three-col .column,
.stack.sidebar--inline .column.narrow {
  max-width: 320px;
  min-width: 200px;
  -fallback-width: 320px;
  width: calc(72200px - 12000%);
}
.stack.sidebar--inline .column.wide {
  max-width: 400px;
  min-width: 320px;
  -fallback-width: 320px;
  width: calc(8000% - 47600px);
}
.stack.two-col.has-gutter .column {
  max-width: 320px;
  min-width: 290px;
  -fallback-width: 320px;
  width: calc(18290px - 3000%);
}
.stack.two-col.has-gutter.has-border .column {
  max-width: 322px;
  min-width: 292px;
  -fallback-width: 322px;
  width: calc(18292px - 3000%);
}
.stack.three-col.has-gutter .column,
.stack.sidebar--inline.has-gutter .column.narrow {
  max-width: 320px;
  min-width: 188px;
  -fallback-width: 320px;
  width: calc(79388px - 13200%);
}
.stack.three-col.has-gutter.has-border .column,
.stack.sidebar--inline.has-gutter.has-border .column.narrow {
  max-width: 322px;
  min-width: 190px;
  -fallback-width: 322px;
  width: calc(79390px - 13200%);
}
.stack.sidebar--inline.has-gutter .column.wide {
  max-width: 394px;
  min-width: 320px;
  -fallback-width: 320px;
  width: calc(7400% - 44006px);
}
.stack.sidebar--inline.has-gutter.has-border .column.wide {
  max-width: 396px;
  min-width: 322px;
  -fallback-width: 322px;
  width: calc(7400% - 44004px);
}
.stack .gutter,
.stack.two-col .column,
.stack.three-col .column,
.stack.sidebar--inline .column {
  Float: left;
}
.stack.two-col .gutter {
  width: 20px;
}
.stack.two-col.has-border .gutter,
.stack.three-col .gutter,
.stack.sidebar--inline .gutter {
  width: 18px;
}
.stack.three-col.has-border .gutter,
.stack.sidebar--inline.has-border .gutter {
  width: 16px;
}
.sidebyside--inline.two-col .gutter {
  width: 3.3%;
}
.sidebyside--inline.two-col.has-border .gutter,
.sidebyside--inline.three-col .gutter,
.sidebyside--inline.sidebar--inline .gutter {
  width: 3%;
}
.sidebyside--inline.three-col.has-border .gutter,
.sidebyside--inline.sidebar--inline.has-border .gutter {
  width: 2.7%;
}
.fixed-width .column,
.full-width--inline .column,
.column__background__inner--inline,
.email-footer .column {
  text-align: left;
}
.fixed-width.has-border + .fixed-width.has-border .layout__inner,
.full-width--inline.has-border + .full-width--inline.has-border {
  border-top: 0 none white;
}
.full-padding .layout--inherit-padding--inline .column__padding--inline:first-child,
.layout.layout--full-padding--inline .column__padding--inline:first-child {
  Margin-top: 24px;
}
.full-padding .layout--inherit-padding--inline .column__padding--inline:last-child,
.layout.layout--full-padding--inline .column__padding--inline:last-child {
  Margin-bottom: 24px;
}
.half-padding .layout--inherit-padding--inline .column__padding--inline:first-child,
.layout--half-padding--inline .column__padding--inline:first-child {
  Margin-top: 12px;
}
.half-padding .layout--inherit-padding--inline .column__padding--inline:last-child,
.layout--half-padding--inline .column__padding--inline:last-child {
  Margin-bottom: 12px;
}
.footer__share-button__container--inline {
  Margin-bottom: 6px;
  mso-line-height-rule: exactly;
}
.footer__share-button__container--inline span {
  font-size: 11px;
}
.footer__share-button__container--inline img {
  display: inline-block;
  margin-right: 2px;
  vertical-align: -3px;
}
.email-footer .footer__share-button__link--inline {
  border-radius: 2px;
  color: #ffffff;
  display: inline-block;
  font-size: 11px;
  font-weight: bold;
  line-height: 19px;
  text-align: left;
  text-decoration: none;
  border-style: solid;
  border-width: 4px 7px 3px 4px;
  mso-border-width-alt: 4px 8px 8px 8px;
}
.email-footer .column {
  font-size: 12px;
  line-height: 19px;
}
.email-footer .column__padding--inline {
  Margin-top: 10px;
  Margin-bottom: 10px;
}
.email-footer__links + * {
  Margin-top: 20px;
}
.email-footer__links td {
  padding: 0;
}
.email-footer__links td + td {
  padding: 0 0 0 3px;
}
.email-footer__address--inline + * {
  Margin-top: 18px;
}
.email-footer__address--inline,
.email-footer__permission--inline,
.email-footer__subscription--inline,
.email-footer__freetext--inline {
  font-size: 12px;
  line-height: 19px;
  margin-bottom: 15px;
}
.flexible-footer--horizontal-padding {
  width: calc(100% - 40px);
  margin: 0 auto;
}
.email-flexible-footer__additionalinfo--inline .email-footer__address--inline {
  margin-top: 0px;
  margin-bottom: 18px;
}
.email-flexible-footer__additionalinfo--inline .email-footer__freetext--inline {
  margin-top: 0px;
  margin-bottom: 18px;
}
.email-flexible-footer .column__padding--inline {
  margin-left: 0;
  margin-right: 0;
}
.email-flexible-footer .footer__share-button__link--inline {
  border-width: 4px 0 4px 4px;
  width: 81px;
  box-sizing: content-box;
}
.email-flexible-footer .center-aligned-footer .column {
  display: inline;
  text-align: center;
}
.email-flexible-footer .center-aligned-footer .footer__share-button__container--inline {
  display: inline-block;
  margin-bottom: 10px;
  margin-left: 5px;
  margin-right: 5px;
}
.email-flexible-footer .right-aligned-footer .column {
  text-align: right;
}
.email-flexible-footer .c-preferences-wrapper {
  display: inline-block;
}
.email-flexible-footer .left-aligned-footer table,
.email-flexible-footer .right-aligned-footer table {
    display: inline-block;
}
.layout__separator--inline,
.column > div > div[style*="font-size:1px"] {
  mso-line-height-rule: exactly;
}
</style>
  <style type="text/css" emb-inline>
.wrapper{background-color:#fbfbfb}.wrapper h1{color:#565656}.wrapper h1{font-size:22px;line-height:31px}.wrapper h1{}.wrapper h1{font-family:Avenir,sans-serif}.wrapper h2{color:#555}.wrapper h2{font-size:17px;line-height:26px}.wrapper h3{color:#555}.wrapper h3{font-size:16px;line-height:24px}.wrapper a{color:#41637e}.fixed-width .column,.full-width--inline .column,.column__background__inner--inline{color:#565656}.fixed-width .column,.full-width--inline .column,.column__background__inner--inline{font-size:14px;line-height:21px}.fixed-width .column,.full-width--inline .column,.column__background__inner--inline{font-family:Georgia,serif}.fixed-width.has-border .layout__inner{border-top:1px solid #c8c8c8;border-right:1px solid #c8c8c8;border-bottom:1px solid #c8c8c8;border-left:1px solid #c8c8c8}.full-width--inline.has-border,.has-gutter.has-border .column__background{border-top:1px solid #c8c8c8;border-bottom:1px solid #c8c8c8}.border{background-color:#c8c8c8}.wrapper blockquote{border-left:4px solid #c8c8c8}.divider{background-color:#c8c8c8}.wrapper .btn a{color:#fff}.wrapper .btn a{font-family:Georgia,serif}.btn--flat a,.btn--shadow a,.btn--depth a{background-color:#41637e}.btn--ghost a{border:1px solid #41637e}.snippet,.webversion,.email-footer .column{color:#999}.snippet,.webversion,.email-footer .column{font-family:Georgia,serif}.wrapper .preheader a,.wrapper .footer__left a{color:#999}.logo{color:#41637e}.logo{font-family:Avenir,sans-serif}.wrapper .logo a{color:#41637e}.footer-logo{color:#7b663d}.footer-logo{font-family:Roboto,Tahoma,sans-serif}.wrapper .footer-logo a{color:#7b663d}.email-footer a{color:#999}.email-footer a:hover{color:#999 !important}.email-footer .footer__share-button__link--inline{background-color:#7e7e7e;border-color:#7e7e7e;mso-border-color-alt:#7e7e7e}
</style><style type="text/css" emb-not-inline>
.main,.mso{background-color:#fbfbfb}.logo a:hover,.logo a:focus{color:#1e2e3b !important}.footer-logo a:hover,.footer-logo a:focus{color:#372d1b !important}.mso .layout-has-border{border-top:1px solid #c8c8c8;border-bottom:1px solid #c8c8c8}.mso .layout-has-bottom-border{border-bottom:1px solid #c8c8c8}.mso .border,.ie .border{background-color:#c8c8c8}.mso h1,.ie h1{}.mso h1,.ie h1{font-size:26px !important;line-height:34px !important}.mso h2,.ie h2{}.mso h2,.ie h2{font-size:20px !important;line-height:28px !important}.mso h3,.ie h3{}.mso .layout__inner,.ie .layout__inner{}.mso .footer__share-button p{}.mso .footer__share-button p{font-family:Georgia,serif}
</style><link href="https://css.createsend1.com/frontend/css/previewiframe.6efbc610a2d0202f7dad.min.css?c=1587855496" rel="stylesheet" /></head>
<!--[if mso]>
  <body class="mso">
<![endif]-->
<!--[if !mso]><!-->
  <body class="main full-padding full-padding">
<!--<![endif]-->
    <table class="wrapper" cellpadding="0" cellspacing="0" role="presentation"><tr><td>
      <div role="banner">
        <div class="preheader">
          <div class="preheader__inner--inline">
          <!--[if (mso)|(IE)]><table align="center" class="preheader" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 280px" valign="top"><![endif]-->
            <div class="snippet">
              
            </div>
          <!--[if (mso)|(IE)]></td><td style="width: 280px" valign="top"><![endif]-->
            <div class="webversion">
              <p emb-social="webversion">${process.env.EMAIL_PREVIEW_TEXT}</p>
            </div>
          <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
          </div>
        </div>
        <div class="header header--padded--inline" id="emb-email-header-container">
        <!--[if (mso)|(IE)]><table align="center" class="header" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 600px"><![endif]-->
          <div class="logo emb-logo-margin-box" align="center" style="Margin-top:6px;Margin-bottom:20px;">
            <div align="left" id="emb-email-header" class="logo-left"><img src="https://i1.createsend1.com/resize/ti/y/92/85E/D9E/eblogo/Group267.png" alt="" width="172" style="max-width:172px"></div>
          </div>
        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
        </div>
      </div>
      <div>

      <div class="layout one-col fixed-width stack layout--inherit-padding--inline">
        <div class="layout__inner" style="background-color: #ffffff;">
        <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #ffffff;"><td style="width: 600px" class="w560"><![endif]-->
          <div class="column">
        
            <div class="column__padding--inline">
        <div class="image--inline" align="center">
          <img alt="" width="84" style="max-width:84px" src="https://i1.createsend1.com/resize/ti/y/92/85E/D9E/eblogo/email1.png">
        </div>
      </div>`;

const emailFooter = `</div>
        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
        </div>
      </div>
      <div class="layout__separator--inline" style="line-height:20px;font-size:20px;">&nbsp;</div>
      </div>
      <div role="contentinfo">
      <div id="footer-top-spacing" style="line-height:4px;font-size:4px;">&nbsp;</div><div class="layout email-flexible-footer email-footer" id="footer-content">
      <div class="layout__inner left-aligned-footer">
        <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-email-footer"><![endif]-->
        <!--[if (mso)|(IE)]><td><table cellpadding="0" cellspacing="0"><![endif]-->
        <!--[if (mso)|(IE)]><td valign="top"><![endif]-->
          <div class="column email-flexible-footer__logo--inline" style="display: none">
      <div class="footer-logo emb-logo-margin-box" align="center" style="Margin-top:6px;Margin-bottom:20px;">
        <div emb-flexible-footer-logo align="center"></div>
      </div>
    </div>
        <!--[if (mso)|(IE)]></td><![endif]-->
        <!--[if (mso)|(IE)]><td valign="top"><![endif]-->
          <div class="column email-flexible-footer__sharing-links--inline" style="display: none">
      <div class="column__padding--inline">
        <div class="footer__share-button">
        </div>
      </div>
    </div>
        <!--[if (mso)|(IE)]></td><![endif]-->
        <!--[if (mso)|(IE)]><td valign="top"><![endif]-->
          <table style="width:600px" cellpadding="0" cellspacing="0"><tr><td><div class="column email-flexible-footer__additionalinfo--inline js-footer-additional-info" style="width:600px">
      <div class="column__padding--inline">
        <div class="email-footer__additional-info email-footer__address--inline">
          <div bind-to="address">
          <p class="email-flexible-footer__additionalinfo--center" style="text-align: center;">${process.env.APP_FOOTER}</p>
          <p class="email-flexible-footer__additionalinfo--center" style="text-align: center;text-decoration: underline;">Unsubscribe</p>
          </div>
        </div>
        <!--<div class="email-footer__additional-info email-footer__subscription--inline">
          <unsubscribe style="text-decoration: underline;">Unsubscribe</unsubscribe>
        </div>-->
        <!--[if mso]>&nbsp;<![endif]-->
      </div>
    </div></td></tr></table>
        <!--[if (mso)|(IE)]></table></td><![endif]-->
        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
      </div>
    </div><div style="line-height:40px;font-size:40px;" id="footer-bottom-spacing">&nbsp;</div></div>
    </td></tr></table>
  <style type="text/css" emb-not-inline>
@media (max-width:619px){.email-flexible-footer .left-aligned-footer .column,.email-flexible-footer .center-aligned-footer,.email-flexible-footer .right-aligned-footer .column{max-width:100% !important;text-align:center !important;width:100% !important}.flexible-footer-logo{margin-left:0px !important;margin-right:0px !important}.email-flexible-footer .left-aligned-footer .flexible-footer__share-button__container,.email-flexible-footer .center-aligned-footer .flexible-footer__share-button__container,.email-flexible-footer .right-aligned-footer .flexible-footer__share-button__container{display:inline-block;margin-left:5px !important;margin-right:5px !important}.email-flexible-footer__additionalinfo--center{text-align:center !important}.email-flexible-footer .left-aligned-footer table,.email-flexible-footer .center-aligned-footer table,.email-flexible-footer .right-aligned-footer table{display:table !important;width:100% !important}.email-flexible-footer .footer__share-button,.email-flexible-footer .email-footer__additional-info{margin-left:20px;margin-right:20px}}
</style><script type="text/javascript" src="https://js.createsend1.com/js/compiled/app/global/polyfill/polyfill.min.js?h=8D4972A220210825125554"></script>
<script type="text/javascript" src="https://js.createsend1.com/js/compiled/app/content/emailPreview-iframe.min.js?h=8AF34A3A20210825125554" data-model='{"Scrollbars":false}'></script>
</body>
</html>`;

exports.contactSupport = (params) => {
  return `${emailHeader}      
    <div class="column__padding--inline">
      <div class="text--inline">
        <h1 style="text-align: center;">${params.heading}</h1><br>
        <h3 style="font-family: avenir,sans-serif; text-align: left;">
        <span class="font-avenir"><strong>Hi ${params.to},</strong></span>
        </h3>
        <h4 style="font-family: avenir,sans-serif; text-align: left;">
        <span class="font-avenir"><strong>From: ${params.from},</strong></span>
        </h4>
        <p style="text-align: left;">${params.message}</p>
      </div>
    </div>   
  ${emailFooter}`;
};

exports.newUser = (params) => {
  return `${emailHeader}       
    <div class="column__padding--inline">
      <div class="text--inline">
        <h1 style="text-align: center;">${params.heading}</h1>
        <h3 style="font-family: avenir,sans-serif; text-align: center;">
        <span class="font-avenir"><strong>Hi ${params.email},</strong></span>
        </h3>
        <p style="text-align: center;">${params.message}
        </p>
        <p style="text-align: center;">Use this link: <a href="${process.env.APP_URL}">${process.env.APP_NAME}</a> , to access your account with the email/password provided below:
       <br>
       Login: ${params.emailPhone}<br/>
       Password: ${params.password}
        </p>
        <br><hr><br>
        <p style="text-align: center;">Receipt Number: ${params.receiptNumber}</p>
      </div>
    </div>
    <div class="column__padding--inline">
      <div class="btn btn--flat btn--large" style="text-align:center;">
        <a cs-button href="#" fix-pos data-vml-width="138" height="48" style="color: blue !important; font-family: Georgia, serif; border-radius: 4px;">
        RRS CODE: ${params.rrsCode}</a>
      </div>
    </div>
 ${emailFooter} `;
};

exports.existingUser = (params) => {
  return `${emailHeader}
    <div class="column__padding--inline">
      <div class="text--inline">
        <h1 style="text-align: center;">${params.heading}</h1>
        <h3 style="font-family: avenir,sans-serif; text-align: center;">
        <span class="font-avenir"><strong>Welcome ${params.email},</strong></span>
        </h3>
        <p style="text-align: center;">${params.message} </p>
        <p style="text-align: center;">Use this link: <a href="${process.env.APP_URL}">${process.env.APP_NAME}</a> , to access your account.</p>
        <br><hr><br>
        <p style="text-align: center;">Receipt Number: ${params.receiptNumber}</p>
      </div>
    </div>
    <div class="column__padding--inline">
      <div class="btn btn--flat btn--large" style="text-align:center;">
        <a cs-button href="#" fix-pos data-vml-width="138" height="48" style="color: blue !important; font-family: Georgia, serif; border-radius: 4px;">
        RRS CODE: ${params.rrsCode}</a>
      </div>
    </div>
  ${emailFooter} `;
};

exports.drawWinner = (params) => {
  return `${emailHeader}
    <div class="column__padding--inline">
      <div class="text--inline">
        <h1 style="text-align: center;">${params.heading}</h1>
        <h3 style="font-family: avenir,sans-serif; text-align: center;">
        <span class="font-avenir"><strong>Dear ${params.name},</strong></span>
        </h3>
        <p style="text-align: center;">${params.message} </p>
        <br><hr><br>
        <p style="text-align: center;">Use this link: <a href="${process.env.APP_URL}">${process.env.APP_NAME}</a> , to access your account.</p>
      </div>
    </div>
  ${emailFooter} `;
};

exports.forgotPassword = (params) => {
  return `${emailHeader}
    <div class="column__padding--inline">
      <div class="text--inline">
        <h1 style="text-align: center;">${params.heading}</h1>
        <p style="text-align: center;">${params.message}</p>
        <p style="text-align: center;">Use this link below to reset your password.</p>
        <br><hr><br>
        <p style="text-align: center;"><a href="${params.url}">${params.url_text}</a> </p>   
      </div>
    </div>
  ${emailFooter} `;
};

exports.resetPassword = (params) => {
  return `${emailHeader}
    <div class="column__padding--inline">
      <div class="text--inline">
        <h1 style="text-align: center;">${params.heading}</h1>
        <p style="text-align: center;">${params.message}</p>
        <p style="text-align: center;">Use this link below to access your account.</p>
        <br><hr><br>
        <p style="text-align: center;"><a href="${process.env.APP_URL}">${process.env.APP_NAME}</a> </p>  
      </div>
    </div>
  ${emailFooter}`;
};

