package main

import (
	"fmt"
	"gateway/mediawiki"
)

// import "gateway/api"

// "gateway/api"

func main() {
	// server := api.NewServer()
	// server.Start()
	e := `== June 2026 ==

[[File:Information.svg|25px|alt=Information icon]] Hello. Thank you for [[Special:Contributions/&#126;2026-35567-69|your contributions]] to [[Wikipedia:About|Wikipedia]]. I noticed that one or more recent edits you made did not have an [[Help:Edit summary|edit summary]]. Collaboration among editors is fundamental to Wikipedia, and every edit should be [[WP:Consensus#Through editing|explained by a clear edit summary]], or by discussion on the [[Help:Talk pages|talk page]]. Please use the edit summary field to explain your reasoning for an edit or to describe what it changes. Summaries save time for other editors and reduce the chances that your edit will be misunderstood. For some edits, an adequate summary may be [[Wikipedia:Edit summary legend/Quick_reference|quite brief]].

The edit summary field looks like this:
{{Edit summary field/OOUI}}

or in the visual editor:
{{Edit summary field/VisualEditor}}

{{strong|Please provide an edit summary for every edit you make.}} If you use a [[WP:ACCOUNT|registered account]], you can give yourself a reminder by setting {{Preferences|Editing|Editor|check={{int:tog-forceeditsummary}}}}, and then click the "{{int:saveprefs}}" button.
Thanks!{{sp}}<!-- Template:uw-editsummary --> [[User:TeaToasst|TeaToasst]] ([[User talk:TeaToasst|talk]]) 14:11, 19 June 2026 (UTC)

[[File:Information orange.svg|25px|alt=Information icon]]  Please do not add commentary to articles, as you did at [[:Dolph Ziggler]]. Doing so violates Wikipedia's [[Wikipedia:Neutral point of view|neutral point of view policy]] and breaches the formal tone expected in an encyclopedia. If you would like to discuss the article, please use [[Talk:Dolph Ziggler]]. Thank you.<!-- Template:uw-talkinarticle2 --> <small>[[User:CycloneYoris|<b style="color:blue; text-shadow:cyan 0.0em 0.0em 0.1em;">CycloneYoris</b>]]</small> <sup>[[User talk:CycloneYoris|<b style="color:purple">''talk!''</b>]]</sup> 09:28, 20 June 2026 (UTC)

== Ziggler ==

I don't know why you keep including the greatest of all time line if has been removed several times. [[User:HHH Pedrigree|HHH Pedrigree]] ([[User talk:HHH Pedrigree|talk]]) 11:04, 20 June 2026 (UTC)

==Disambiguation link notification for June 22 ==

Hi. Thank you for your recent edits. An automated process has detected that you've added some links pointing to [[Wikipedia:Disambiguation|disambiguation pages]]. Such links are [[WP:INTDABLINK|usually incorrect]], since a disambiguation page is merely a list of unrelated topics with similar titles. <small>(Read the [[User:DPL bot/Dablink notification FAQ|FAQ]]{{*}} Join us at the [[Wikipedia:Disambiguation pages with links|DPL WikiProject]].)</small>
:[[Fantastica Mania]]
::added a link pointing to [[Averno]]
:[[Swerve Strickland]]
::added a link pointing to [[Keith Lee]]

It's OK to remove this message. Also, to stop receiving these messages, follow these [[User:DPL bot|opt-out instructions]]. Thanks, --[[User:DPL bot|DPL bot]] ([[User talk:DPL bot|talk]]) 22:38, 22 June 2026 (UTC)

==Disambiguation link notification for June 29 ==

An automated process has detected that you recently added links to disambiguation pages.
:[[Fantastica Mania]]
::added a link pointing to [[Averno]]
:[[PWA Champions Grail]]
::added a link pointing to [[MLP Mayhem]]

([[User:DPL bot|Opt-out instructions]].) --[[User:DPL bot|DPL bot]] ([[User talk:DPL bot|talk]]) 22:50, 29 June 2026 (UTC)

== July 2026 ==

[[File:Information.svg|25px|alt=Information icon]] Hello, I'm [[User:Mesocyclonic93|Mesocyclonic93]]. I noticed that you recently [[Wikipedia:Content removal|removed content]] from [[:Santi Cazorla]]&nbsp;without adequately explaining why. In the future, it would be helpful to others if you described your changes to Wikipedia with an accurate [[Help:Edit summary|edit summary]]. If this was a mistake, don't worry; the removed content has been restored. If you would like to experiment, please use the [[Wikipedia:Sandbox|sandbox]]. If you think I made a mistake, or if you have any questions, you can leave me a message on [[User_talk:Mesocyclonic93|my talk page]]. Thanks.<!-- Template:uw-delete1 --> [[User:Mesocyclonic93|Mesocyclonic93]] <small><sup>([[User talk:Mesocyclonic93|t]])</sup><sub>([[Special:Contributions/Mesocyclonic93|c]])</sub></small> 19:03, 2 July 2026 (UTC)

[[File:information.svg|25px|alt=Information icon]] Please don't change the format of dates, as you did to [[:Merlin Röhl]]. As a general rule, if an article has evolved using predominantly one format, the dates should be left in the format they were originally written in, unless there are reasons for changing it based on either '''strong''' [[MOS:DATETIES|national ties to the topic]] or if the topic is [[MOS:MILFORMAT|tied to an armed forces]]. Please also note that Wikipedia does not use ordinal suffixes (e.g., st, nd, th), articles, or leading zeros on dates.

For more information about how dates should be written on Wikipedia, please see [[WP:DATE|this page]].

If you have any questions about this, ask me on my talk page, or place <code>{{t|helpme}}</code> on your talk page and someone will show up shortly to answer your questions. Enjoy your time on Wikipedia. Thank you. <!-- Template:uw-date --> [[User:Denisarona|Denisarona]] ([[User talk:Denisarona|talk]]) 13:26, 8 July 2026 (UTC)
`

	fmt.Println(mediawiki.GetWarningLevel(e))
}
