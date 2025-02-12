export const SGWLocation = {
    latitude: 45.49572423745457,
    longitude: -73.5792924947185,
    longitudeDelta: 0.009,
    latitudeDelta: 0.009
}

export const LoyolaLocation = {
    latitude: 45.45816789282539, 
    longitude: -73.63913470125503,
    longitudeDelta: 0.009,
    latitudeDelta: 0.009
}

export const SGWShuttlePickup = {
  latitude: 45.497199717584444, longitude: -73.57838187403725
}

export const LoyolaShuttlePickup = {
  latitude:45.458414933237755, longitude:-73.63832632000991
}

export const polygons = [
    {
      name: "JMSB",
      point: {
        latitude:45.49530941266274, longitude:-73.57894088705565
      },
      isSGW: true,
      departments: ["Contemporary Dance", "Music","Theatre"],
      address: "1550 De Maisonneuve W",
      boundaries: [
        { latitude: 45.49551700939489, longitude: -73.57919959372754 },
        { latitude: 45.4954397197586, longitude: -73.57896102832657 },
        { latitude: 45.49518606830963, longitude: -73.57852599872287 },
        { latitude: 45.49500549233436, longitude: -73.57873649791833 },
        { latitude: 45.49503851629257, longitude: -73.57879062580767 },
        { latitude: 45.49500689787472, longitude: -73.57882470659737 },
        { latitude: 45.495166396011605, longitude: -73.57917052475594 },
        { latitude: 45.49522260668791, longitude: -73.57911539421796 },
        { latitude: 45.49535775430131, longitude: -73.57936600218756 },
      ],
    },
    {
      name: "B Annex",
      point: {
        latitude:45.49781725012627, longitude:-73.57950979221253 
      },
      isSGW: true,
      departments: ["Engineering and Computer Science Association"],
      address: "2160 Bishop",
      boundaries: [
        { latitude: 45.49792095946769, longitude: -73.57946059720679 },
        { latitude: 45.497883828222086, longitude: -73.57938683641203 },
        { latitude: 45.49770522278876, longitude: -73.57955983916031 },
        { latitude: 45.49773953383409, longitude: -73.57963561147946 },
      ],
    },
    {
      name: "CI Annex",
      address: "2149 Mackay St",
      departments: ["School of Community & Public Affairs"],
      point: {
        latitude:45.49747535175269, longitude:-73.57989583757855
      },
      isSGW: true,
      boundaries: [
        { latitude: 45.497584772601584, longitude: -73.57983829805465 },
        { latitude: 45.49754529100982, longitude: -73.57976051398938 },
        { latitude: 45.49736762466014, longitude: -73.57993686966716 },
        { latitude: 45.497406636120175, longitude: -73.58001599469759 },
      ],
    },
    {
      name: "CL Annex",
      address: "1665 Saint-Catherine St W",
      point: {
        latitude: 45.49422725158271, longitude: -73.57929532647677
      },
      isSGW: true,
      boundaries: [
        { latitude: 45.49447132432611, longitude: -73.5792829162498 },
        { latitude: 45.494260599618514, longitude: -73.57893678577295 },
        { latitude: 45.49403791147239, longitude: -73.57920989850005 },
        { latitude: 45.49398007902392, longitude: -73.57932748808616 },
        { latitude: 45.49398473227538, longitude: -73.57935404049162 },
        { latitude: 45.49416421309779, longitude: -73.57965749711603 },
      ],
    },
    {
      name: "EN Annex",
      address: "2070 Mackay",
      point: {
        latitude:45.49692834804806, longitude:-73.5797433750953
      },
      isSGW: true,
      boundaries: [
        { latitude: 45.49698630180552, longitude: -73.5797415843998 },
        { latitude: 45.496949169963464, longitude: -73.57966581200046 },
        { latitude: 45.496849995409846, longitude: -73.579763042313 },
        { latitude: 45.49687396656502, longitude: -73.57981266311516 },
        { latitude: 45.49689746766146, longitude: -73.57979053487995 },
        { latitude: 45.496911098311465, longitude: -73.57981601585321 },
      ],
    },
    {
      name: "ER Building",
      boundaries: ["Computer Science and Software Engineering"],
      address: "2155 Guy St, Montreal",
      point: {
        latitude: 45.49630521099936, longitude:-73.58019820078486
      },
      isSGW: true,
      boundaries: [
        { latitude: 45.49642205927201, longitude: -73.5803519706359 },
        { latitude: 45.49629705006199, longitude: -73.57985133782692 },
        { latitude: 45.49623981850381, longitude: -73.57989216295483 },
        { latitude: 45.4962533073332, longitude: -73.57993352358412 },
        { latitude: 45.49616461020968, longitude: -73.57999580464889 },
        { latitude: 45.49619856500288, longitude: -73.58008971906492 },
        { latitude: 45.496176390712414, longitude: -73.5801065249803 },
        { latitude: 45.49629072764227, longitude: -73.58044066318608 },
        { latitude: 45.49642100187277, longitude: -73.58034971391501 },
      ],
    },
    {
      name: "EV Building",
      address: "1515 Saint-Catherine St W",
      departments: ["Art Education", "Art History","Contemporary Dance"],
      point: {
        latitude:45.4954715874386, longitude:-73.57799996419087
      },
      boundaries: [
        { latitude: 45.495864910655214, longitude: -73.5784949088164 },
        { latitude: 45.49544740149519, longitude: -73.57761297797327 },
        { latitude: 45.49535511107987, longitude: -73.57769657441521 },
        { latitude: 45.495352181495605, longitude: -73.57774464167757 },
        { latitude: 45.49523791718607, longitude: -73.57787630503759 },
        { latitude: 45.495234987470475, longitude: -73.57791183292507 },
        { latitude: 45.495246706967556, longitude: -73.57791392270593 },
        { latitude: 45.49526428653158, longitude: -73.57799960743661 },
        { latitude: 45.495248172311214, longitude: -73.57802050628338 },
        { latitude: 45.49559389701189, longitude: -73.57876241371773 },
      ],
    },
    {
      name: "FA Annex",
      point: {
        latitude:45.496893526958395, longitude:-73.57965328949106
      },
      address:"2060 MacKay, 2080 Mackay St",
      boundaries: [
        { latitude: 45.496948005596415, longitude: -73.57966550307407 },
        { latitude: 45.496907520116025, longitude: -73.57957844786766 },
        { latitude: 45.49681422824224, longitude: -73.57967136314527 },
        { latitude: 45.49685706062825, longitude: -73.57975674411148 },
      ],
    },
    {
      name: "FB Building",
      point: {
        latitude:45.49468404750868,longitude: -73.5776489392095
      },
      address: "1250 Guy St",
      departments: ["District 3 Innovation Center","School of Cinema"],
      boundaries: [
        { latitude: 45.494910829307685, longitude: -73.57778731254975 },
        { latitude: 45.494869794198756, longitude: -73.5777118267677 },
        { latitude: 45.49487735326464, longitude: -73.57770412410044 },
        { latitude: 45.49483523824385, longitude: -73.5776332600053 },
        { latitude: 45.49484171743508, longitude: -73.57762401680954 },
        { latitude: 45.49479744261575, longitude: -73.57755007177032 },
        { latitude: 45.49480608152471, longitude: -73.5775362069734 },
        { latitude: 45.49476396639133, longitude: -73.57746534306945 },
        { latitude: 45.49477368516465, longitude: -73.57745301878315 },
        { latitude: 45.49469161445501, longitude: -73.57730666962216 },
        { latitude: 45.49470025334885, longitude: -73.57729588585623 },
        { latitude: 45.49465489840401, longitude: -73.5772188601305 },
        { latitude: 45.49439897085458, longitude: -73.57752080437143 },
        { latitude: 45.494695935430386, longitude: -73.57803995878238 },
      ],
    },
    {
      name: "FG Building",
      point: {
        latitude:45.49416585105086, longitude:-73.57833248965449
      },
      address: "1610 St. Catherine W.",
      departments: ["Education"],
      boundaries: [
        { latitude: 45.49469528170287, longitude: -73.57803758887717 },
        { latitude: 45.49444362886454, longitude: -73.57760516680655 },
        { latitude: 45.494405500786094, longitude: -73.57763780389504 },
        { latitude: 45.494403595085345, longitude: -73.57769491697631 },
        { latitude: 45.49443219217487, longitude: -73.57775474894106 },
        { latitude: 45.49439406422713, longitude: -73.57780098421658 },
        { latitude: 45.494369280360885, longitude: -73.57777106850229 },
        { latitude: 45.49418626608279, longitude: -73.57799136495852 },
        { latitude: 45.49419961131975, longitude: -73.57801856122799 },
        { latitude: 45.49410619752385, longitude: -73.57811919004236 },
        { latitude: 45.49391174415719, longitude: -73.57834220371235 },
        { latitude: 45.49392318283658, longitude: -73.5783612410207 },
        { latitude: 45.49389077389949, longitude: -73.5783993163399 },
        { latitude: 45.493837394302574, longitude: -73.57844011148637 },
        { latitude: 45.49384883300174, longitude: -73.5784645880516 },
        { latitude: 45.49362959551419, longitude: -73.57872839383569 },
        { latitude: 45.49382214516472, longitude: -73.57906562662778 },
      ],
    },
    {
      name: "Grey Nuns Building",
      point: {
        latitude:45.493486154634866, longitude:-73.57669450029397
      },
      address: "1175 Rue St Mathieu",
      boundaries: [
        { latitude: 45.49438634877265, longitude: -73.57705379340725 },
        { latitude: 45.49401699180863, longitude: -73.57628160350787 },
        { latitude: 45.49411888142206, longitude: -73.57617712842716 },
        { latitude: 45.49403768547171, longitude: -73.57598862398478 },
        { latitude: 45.493932611955394, longitude: -73.57609537054854 },
        { latitude: 45.493714496650334, longitude: -73.57564114548599 },
        { latitude: 45.49357121493153, longitude: -73.57578650255839 },
        { latitude: 45.493794105915256, longitude: -73.5762429978415 },
        { latitude: 45.493493211181836, longitude: -73.57654051936547 },
        { latitude: 45.49347092222862, longitude: -73.57649736803604 },
        { latitude: 45.49334355946133, longitude: -73.57662001092092 },
        { latitude: 45.49336425638509, longitude: -73.57667224674238 },
        { latitude: 45.49302514555752, longitude: -73.57700383259919 },
        { latitude: 45.49294076503771, longitude: -73.57683349828295 },
        { latitude: 45.49295031706197, longitude: -73.57679488875564 },
        { latitude: 45.49292643571195, longitude: -73.57674719521226 },
        { latitude: 45.492899880540165, longitude: -73.57674318426533 },
        { latitude: 45.49273292910005, longitude: -73.57639747264099 },
        { latitude: 45.492589094967244, longitude: -73.57653636914742 },
        { latitude: 45.492746208536225, longitude: -73.5768646644639 },
        { latitude: 45.4926742912157, longitude: -73.5769246420757 },
        { latitude: 45.49267761057378, longitude: -73.5769656791137 },
        { latitude: 45.49271190979093, longitude: -73.57703039129541 },
        { latitude: 45.49279267855374, longitude: -73.57697672715273 },
        { latitude: 45.492810381295435, longitude: -73.5769656786292 },
        { latitude: 45.49289889528501, longitude: -73.57714087557987 },
        { latitude: 45.49284136133063, longitude: -73.57720243135635 },
        { latitude: 45.49284136133045, longitude: -73.57719927465146 },
        { latitude: 45.49292766210957, longitude: -73.57737605040082 },
        { latitude: 45.492995153956834, longitude: -73.57731607308212 },
        { latitude: 45.493085880224506, longitude: -73.57750705479113 },
        { latitude: 45.493198735586866, longitude: -73.57739814844017 },
        { latitude: 45.49311022196007, longitude: -73.57721663669459 },
        { latitude: 45.493362484673725, longitude: -73.57696094322256 },
        { latitude: 45.49335142052184, longitude: -73.57693568960171 },
        { latitude: 45.493437022994776, longitude: -73.57685530566616 },
        { latitude: 45.49347929498911, longitude: -73.57693834563663 },
        { latitude: 45.49345157581328, longitude: -73.57696306005596 },
        { latitude: 45.493527803799324, longitude: -73.5771241974008 },
        { latitude: 45.49357631241137, longitude: -73.57708366581527 },
        { latitude: 45.49360264567801, longitude: -73.57713408313238 },
        { latitude: 45.4935811632878, longitude: -73.57715682035976 },
        { latitude: 45.49363590867164, longitude: -73.57726556373488 },
        { latitude: 45.49374747859582, longitude: -73.57715682040825 },
        { latitude: 45.49367332960021, longitude: -73.57700260242501 },
        { latitude: 45.49372738200468, longitude: -73.57694526477181 },
        { latitude: 45.49366778541375, longitude: -73.57682268145551 },
        { latitude: 45.49361511902614, longitude: -73.57687606486948 },
        { latitude: 45.49355344339337, longitude: -73.5767465618282 },
        { latitude: 45.493896188967405, longitude: -73.57640564801245 },
        { latitude: 45.49419436711984, longitude: -73.5770212999288 },
        { latitude: 45.49386974358528, longitude: -73.57734205999982 },
        { latitude: 45.49397724904694, longitude: -73.57755757074672 },
        { latitude: 45.49412410253305, longitude: -73.57741423110495 },
        { latitude: 45.49409529395125, longitude: -73.57734807423398 },
      ],
    },
    {
      name: "Guy-de Maisonneuve",
      point: {
        latitude:45.495871434958005, longitude:-73.57879508417773
      },
      address: "1550 De Maisonneuve W.",
      departments: ["Contemporary Dance","Music","Theatre"],
      boundaries: [
        { latitude: 45.496127875902936, longitude: -73.57880793921294 },
        { latitude: 45.49594500840482, longitude: -73.57843483789237 },
        { latitude: 45.49562014098773, longitude: -73.57874527194326 },
        { latitude: 45.4957795107126, longitude: -73.57909068085692 },
        { latitude: 45.49576622991224, longitude: -73.57910525507967 },
        { latitude: 45.4957825754549, longitude: -73.5791446055754 },
      ],
    },
    {
      name: "GS Building",
      point: {
        latitude:45.496598173335705,longitude:-73.58117219175675
      },
      address: "1538 Sherbrooke St. W.",
      boundaries: [
        { latitude: 45.49675255522154, longitude: -73.58136675153412 },
        { latitude: 45.49674206620078, longitude: -73.58132373010108 },
        { latitude: 45.49675714412983, longitude: -73.58131437758934 },
        { latitude: 45.496725021461344, longitude: -73.58122085279066 },
        { latitude: 45.49670928797648, longitude: -73.58122927007602 },
        { latitude: 45.49665290920157, longitude: -73.58105718468921 },
        { latitude: 45.49663324235967, longitude: -73.58106934302383 },
        { latitude: 45.496543429449574, longitude: -73.58079063892136 },
        { latitude: 45.496412972538636, longitude: -73.58087200642291 },
        { latitude: 45.49660505340855, longitude: -73.58146308209406 },
      ],
    },
    {
      name: "Hall Building",
      address:"1550 De Maisonneuve West",
      departments: ["Geography, Planning & Environment","School of Irish Studies"],
      isSGW: true,
      point: {
        latitude:45.4972978299552, longitude:-73.57895294688963
      },
      boundaries: [
        { latitude: 45.49770855552633, longitude: -73.57903354341569 },
        { latitude: 45.497373319897925, longitude: -73.57833984117559 },
        { latitude: 45.496830653246924, longitude: -73.57884651747182 },
        { latitude: 45.49716588620114, longitude: -73.57954021516892 },
      ],
    },
    {
      name: "K Annex",
      boundaries: [
        { latitude: 45.497741466457285, longitude: -73.57963574821775 },
        { latitude: 45.49773566772766, longitude: -73.57953026960946 },
        { latitude: 45.497706190814846, longitude: -73.57956129273359 },
        { latitude: 45.49774050000023, longitude: -73.57963574821667 },
      ],
    },
    {
      name: "LB Building",
      point: {
        latitude:45.496806875043575, longitude:-73.57794802982542
      },
      address: "1400 De Maisonneuve Blvd. W.",
      departments: ["CISSC","Education","English"],
      boundaries: [
        { latitude: 45.49725839136548, longitude: -73.57805850161982 },
        { latitude: 45.49704004318071, longitude: -73.57759018965103 },
        { latitude: 45.49700439498505, longitude: -73.5776198569998 },
        { latitude: 45.49697617303374, longitude: -73.57756688079701 },
        { latitude: 45.49700587984721, longitude: -73.57754145163722 },
        { latitude: 45.49689299142933, longitude: -73.57729564217011 },
        { latitude: 45.49661374784159, longitude: -73.57756052832643 },
        { latitude: 45.49663602834692, longitude: -73.57760078998999 },
        { latitude: 45.496584041440464, longitude: -73.57765164774675 },
        { latitude: 45.49649788989184, longitude: -73.5774694108162 },
        { latitude: 45.49625577697866, longitude: -73.57770038745157 },
        { latitude: 45.496673163839056, longitude: -73.57856919587815 },
        { latitude: 45.49670732702751, longitude: -73.57853317199103 },
        { latitude: 45.49672960728491, longitude: -73.57857767227397 },
        { latitude: 45.49689151102594, longitude: -73.5784187429018 },
        { latitude: 45.49687071605529, longitude: -73.57836576629461 },
        { latitude: 45.49699845647251, longitude: -73.57825769366399 },
        { latitude: 45.497013310059, longitude: -73.57828947966918 },
      ],
    },
    {
      name: "LS Building",
      point: {
        latitude:45.49636175524323, longitude:-73.5794351580434
      },
      departments: ["IT Services"],
      address: "1535 De Maisonneuve Blvd. W.",
      boundaries: [
        { latitude: 45.49653374701379, longitude: -73.57956990256748 },
        { latitude: 45.49638147665505, longitude: -73.57923444889067 },
        { latitude: 45.4961639488161, longitude: -73.57944724830239 },
        { latitude: 45.49627064135178, longitude: -73.57967186857971 },
        { latitude: 45.496369047031386, longitude: -73.57958172479184 },
        { latitude: 45.4964177318974, longitude: -73.57968221317532 },
      ],
    },
    {
      name: "M Annex",
      point: {
        latitude: 45.497359445972506, longitude:-73.57977066219894
      },
      address: "2135 Mackay St",
      boundaries: [
        { latitude: 45.49742664469608, longitude: -73.57975562224226 },
        { latitude: 45.49738763308881, longitude: -73.57968119104282 },
        { latitude: 45.49729113621533, longitude: -73.57978081005011 },
        { latitude: 45.497328474309526, longitude: -73.5798534486175 },
      ],
    },
    {
      name: "MI Annex",
      boundaries: [
        { latitude: 45.497145688060556, longitude: -73.58004258190762 },
        { latitude: 45.4971151308179, longitude: -73.5799775601368 },
        { latitude: 45.497022423706944, longitude: -73.58006918203132 },
        { latitude: 45.49704262255674, longitude: -73.58014454812006 },
      ],
    },
    {
      name: "MU Annex",
      point: {
        latitude:45.49787093515154, longitude:-73.57957660874176
      },
      address: "2170 Bishop",
      departments: ["CUPFA","Concordia Coop Bookstore"],
      boundaries: [
        { latitude: 45.49796235489539, longitude: -73.57953690960254 },
        { latitude: 45.49792034354915, longitude: -73.57946198964135 },
        { latitude: 45.49774809748494, longitude: -73.57962906129215 },
        { latitude: 45.497784857315565, longitude: -73.57970398113726 },
      ],
    },
    {
      name: "P Annex",
      point: {
        latitude: 45.49672080173269, longitude:-73.57935779880465
      },
      address: "2020 Mackay St",
      boundaries: [
        { latitude: 45.49665200424951, longitude:-73.57947787452528},
        { latitude: 45.49679618611247, longitude:-73.57933169538711 },
        { latitude: 45.496759591765965, longitude:-73.57925547340794 },
        { latitude: 45.49661467792026, longitude:-73.5793995642727 },
      ],
    },
    {
      name: "PR Annex",
      boundaries: [
        { latitude: 45.49697618368829, longitude: -73.57990716507766 },
        { latitude: 45.49700062485126, longitude: -73.57994069260441 },
        { latitude: 45.49703117618106, longitude: -73.57990850598023 },
        { latitude: 45.49700438490997, longitude: -73.5798790017726 },
      ],
    },
    {
      name: "Q Annex",
      point: {
        latitude:45.4966176054764, longitude:-73.57910198531287
      },
      address: "2010 Mackay St",
      boundaries: [
        { latitude: 45.49667618698685, longitude: -73.57908077242534 },
        { latitude: 45.496645635316945, longitude: -73.57902444612301 },
        { latitude: 45.49655210064283, longitude: -73.5791203352979 },
        { latitude: 45.49658359231981, longitude: -73.57917934375665 },
      ],
    },
    {
      name: "R Annex",
      boundaries: [
        { latitude: 45.496837546460505, longitude: -73.57942022786025 },
        { latitude: 45.49679994456985, longitude: -73.57934512594144 },
        { latitude: 45.496786783922495, longitude: -73.57935786645686 },
        { latitude: 45.49682579587469, longitude: -73.57943095670727 },
      ],
    },
    {
      name: "RR Annex",
      point: {
        latitude:45.496768374411296, longitude:-73.57944237387743
      },
      address: "2040 Mackay St",
      departments: ["Liberal Arts College"],
      boundaries: [
        { latitude: 45.496831906175686, longitude: -73.57944503832626 },
        { latitude: 45.49679054410886, longitude: -73.57935451368968 },
        { latitude: 45.49669653944171, longitude: -73.579446379349 },
        { latitude: 45.49673743141687, longitude: -73.57953288059016 },
      ],
    },
    {
      name: "S Annex",
      point: {
        latitude: 45.49740510973528, longitude:-73.57984883775381
      },
      address: "2145 Mackay St",
      departments: ["Department of Philosophy"],
      boundaries: [
        { latitude: 45.49749068391561, longitude: -73.57981334272769 },
        { latitude: 45.49745919263725, longitude: -73.57975299305292 },
        { latitude: 45.497436161798284, longitude: -73.57977445081488 },
        { latitude: 45.49742723143184, longitude: -73.57975634592628 },
        { latitude: 45.49732711775906, longitude: -73.5798549172845 },
        { latitude: 45.49736800934895, longitude: -73.57993538341181 },
      ],
    },
    {
      name: "Samuel Bronfman Building",
      boundaries: [
        { latitude: 45.49668345633299, longitude: -73.58608699270188 },
        { latitude: 45.496652904603266, longitude: -73.58601390251683 },
        { latitude: 45.49657958072064, longitude: -73.58599915068382 },
        { latitude: 45.496540098717716, longitude: -73.5860320078947 },
        { latitude: 45.49651941782507, longitude: -73.58616745934783 },
        { latitude: 45.49653868886063, longitude: -73.58620970406193 },
      ],
    },
    {
      name: "Toronto-Dominion Building",
      boundaries: [
        { latitude: 45.49503798021289, longitude: -73.5783455966998 },
        { latitude: 45.495117886635555, longitude: -73.57848238914504 },
        { latitude: 45.49514890906567, longitude: -73.57844483818002 },
        { latitude: 45.49508404376782, longitude: -73.57829731682057 },
      ],
    },
    {
      name: "V Annex",
      point: {
        latitude:45.49706797687867,longitude: -73.58006719227089
      },
      address: "2090 Mackay St",
      boundaries: [
        { latitude: 45.497087190183805, longitude: -73.57991517059297 },
        { latitude: 45.4970481782724, longitude: -73.57983403377729 },
        { latitude: 45.49694524374355, longitude: -73.57993796974215 },
        { latitude: 45.49698519562631, longitude: -73.58001709481047 },
      ],
    },
    {
      name: "Visual Arts Building",
      point: {
        latitude:45.4956849583822, longitude:-73.5739600415101
      },
      isSGW: true,
      boundaries: [
        { latitude: 45.49618526149293, longitude: -73.57379772657498 },
        { latitude: 45.49606642975251, longitude: -73.57356251091662 },
        { latitude: 45.495816887394135, longitude: -73.57381256392812 },
        { latitude: 45.49566537679379, longitude: -73.5735031832002 },
        { latitude: 45.49540395172909, longitude: -73.57376806794427 },
        { latitude: 45.495671321592255, longitude: -73.57430842410997 },
      ],
    },
    {
      name: "X Annex",
      point: {
        latitude: 45.49695760325471, longitude: -73.5798358084977
      },
      address: "2080 Mackay St",
      boundaries: [
        { latitude: 45.49701825801721, longitude: -73.57982924145175 },
        { latitude: 45.49697830609942, longitude: -73.57975078691274 },
        { latitude: 45.49689370233626, longitude: -73.57983259442715 },
        { latitude: 45.49693271416103, longitude: -73.57991373110718 },
      ],
    },
    {
      name: "Z Annex",
      boundaries: [
        { latitude: 45.497087821235226, longitude: -73.57991574272076 },
        { latitude: 45.49704880941643, longitude: -73.57983460581892 },
        { latitude: 45.496945874762844, longitude: -73.57993787096589 },
        { latitude: 45.49698441648519, longitude: -73.5800190077885 },
      ],
    },
    {
      name: "Administration Building",
      boundaries: [
        { latitude: 45.45800335055294, longitude: -73.6396736034014 },
        { latitude: 45.45802404580459, longitude: -73.63975138745974 },
        { latitude: 45.45791492530121, longitude: -73.63983453593589 },
        { latitude: 45.45788670444699, longitude: -73.63976479850429 },
        { latitude: 45.45780016040598, longitude: -73.63983185372699 },
        { latitude: 45.45791492530121, longitude: -73.64012421449797 },
        { latitude: 45.45798829945605, longitude: -73.640065205902 },
        { latitude: 45.45796572280318, longitude: -73.64000887951492 },
        { latitude: 45.45810494535182, longitude: -73.6399042733675 },
        { latitude: 45.45827991374306, longitude: -73.6397701629221 },
        { latitude: 45.458298727516244, longitude: -73.63982112489136 },
        { latitude: 45.458377745295046, longitude: -73.63976479850429 },
        { latitude: 45.45825357445007, longitude: -73.6394456156442 },
        { latitude: 45.458170793734816, longitude: -73.6395073064491 },
        { latitude: 45.45820653996768, longitude: -73.63961191259652 },
        { latitude: 45.45809553843368, longitude: -73.63969506107267 },
        { latitude: 45.45806731766987, longitude: -73.63963337026779 },
      ],
    },
    {
      name: "BB Annex",
      boundaries: [
        { latitude: 45.45969472027361, longitude: -73.63916844992578 },
        { latitude: 45.459726007683315, longitude: -73.6392434266539 },
        { latitude: 45.45981520999015, longitude: -73.63916750085328 },
        { latitude: 45.45978525400733, longitude: -73.63909347319763 },
      ],
    },
    {
      name: "BH Annex",
      boundaries: [
        { latitude: 45.4596656895243, longitude: -73.63909275582184 },
        { latitude: 45.45969579081858, longitude: -73.63916584601458 },
        { latitude: 45.459785153941255, longitude: -73.63909141471738 },
        { latitude: 45.45975411203048, longitude: -73.63901832452463 },
      ],
    },
    {
      name: "Central Building",
      boundaries: [
        { latitude: 45.4581042021557, longitude: -73.63995784322546 },
        { latitude: 45.45809537104427, longitude: -73.63996287928404 },
        { latitude: 45.458102435935196, longitude: -73.639995613659 },
        { latitude: 45.45808124125972, longitude: -73.64001323986089 },
        { latitude: 45.45838149841903, longitude: -73.64079382880223 },
        { latitude: 45.45852809398066, longitude: -73.64068303553314 },
        { latitude: 45.45822253894564, longitude: -73.63989992856295 },
        { latitude: 45.45816601991378, longitude: -73.63994021702446 },
        { latitude: 45.4581430590409, longitude: -73.63988733841876 },
        { latitude: 45.458090072375484, longitude: -73.63992259082255 },
      ],
    },
    {
      name: "Communication Studies and Journalism Building",
      boundaries: [
        { latitude: 45.45740882916023, longitude: -73.64020736298139 },
        { latitude: 45.45717741566173, longitude: -73.64039243539604 },
        { latitude: 45.4572771305377, longitude: -73.64065797407794 },
        { latitude: 45.45730347028681, longitude: -73.64063919861559 },
        { latitude: 45.45733545425132, longitude: -73.64071966488282 },
        { latitude: 45.45759696951595, longitude: -73.64050508817017 },
        { latitude: 45.45765153010169, longitude: -73.64063115198887 },
        { latitude: 45.457832144077855, longitude: -73.64048363049892 },
        { latitude: 45.45775688832475, longitude: -73.64029319366642 },
        { latitude: 45.457728667391464, longitude: -73.64031465133769 },
        { latitude: 45.457621427716084, longitude: -73.64004374823797 },
        { latitude: 45.457484085377835, longitude: -73.6401510365943 },
        { latitude: 45.457437050253596, longitude: -73.64002765498454 },
        { latitude: 45.45747844116499, longitude: -73.6398238071075 },
        { latitude: 45.45742665538659, longitude: -73.63977224287744 },
        { latitude: 45.457364568951085, longitude: -73.63976151404181 },
        { latitude: 45.45731000808767, longitude: -73.63978297171307 },
        { latitude: 45.4572516843477, longitude: -73.63983661589123 },
        { latitude: 45.457230988812576, longitude: -73.63988221344268 },
        { latitude: 45.45721405609638, longitude: -73.64001095947027 },
        { latitude: 45.45736268754287, longitude: -73.64007533248406 },
      ],
    },
    {
      name: "Stinger Dome",
      boundaries: [
        { latitude: 45.45792374396299, longitude: -73.63524187780685 },
        { latitude: 45.45696046430309, longitude: -73.63636304113045 },
        { latitude: 45.45737437554821, longitude: -73.63708187311784 },
        { latitude: 45.45833012263398, longitude: -73.63595534537642 },
      ],
    },
    {
      name: "F. C. Smith Building",
      boundaries: [
        { latitude: 45.45838268252303, longitude: -73.63904194723771 },
        { latitude: 45.45850801353835, longitude: -73.63942164268585 },
        { latitude: 45.45848339496803, longitude: -73.63944078699416 },
        { latitude: 45.458546060398575, longitude: -73.63960032289674 },
        { latitude: 45.45858186918477, longitude: -73.63957798787038 },
        { latitude: 45.458617677948226, longitude: -73.63966094653972 },
        { latitude: 45.45866467691573, longitude: -73.63968647228414 },
        { latitude: 45.4587430084412, longitude: -73.63962265792311 },
        { latitude: 45.458754198650226, longitude: -73.63956522499817 },
        { latitude: 45.45870496171385, longitude: -73.63937697263313 },
        { latitude: 45.45874524648319, longitude: -73.63933868401651 },
        { latitude: 45.458725104102115, longitude: -73.63928125109157 },
        { latitude: 45.45867586714032, longitude: -73.63930039539989 },
        { latitude: 45.45853487014824, longitude: -73.6389238906698 },
      ],
    },
    {
      name: "Center for Structural and Functional Genomics",
      boundaries: [
        { latitude: 45.45679811634551, longitude: -73.64035333241623 },
        { latitude: 45.456896593505434, longitude: -73.64060858986035 },
        { latitude: 45.456871974231575, longitude: -73.64062773416866 },
        { latitude: 45.456896593505434, longitude: -73.64069154852969 },
        { latitude: 45.456921212768535, longitude: -73.64067559493944 },
        { latitude: 45.45694807013422, longitude: -73.64073940930047 },
        { latitude: 45.45717635722601, longitude: -73.64057349196179 },
        { latitude: 45.45704430892283, longitude: -73.64016827076922 },
      ],
    },
    {
      name: "Hingston Hall, wing HA",
      boundaries: [
        { latitude: 45.45925073011908, longitude: -73.64106265529762 },
        { latitude: 45.459283041472254, longitude: -73.64114162537777 },
        { latitude: 45.45926919375174, longitude: -73.6411514966378 },
        { latitude: 45.45939382311411, longitude: -73.64147066737846 },
        { latitude: 45.45940536285596, longitude: -73.64145750569844 },
        { latitude: 45.459441136040645, longitude: -73.6415479922486 },
        { latitude: 45.45969039372979, longitude: -73.64134892183819 },
        { latitude: 45.45949998865069, longitude: -73.6408685205085 },
      ],
    },
    {
      name: "Hingston Hall, wing B",
      boundaries: [
        { latitude: 45.4589717294752, longitude: -73.64181214555022 },
        { latitude: 45.45899583377771, longitude: -73.64187923916282 },
        { latitude: 45.458964842529745, longitude: -73.64190542203605 },
        { latitude: 45.45910602474372, longitude: -73.64227034583148 },
        { latitude: 45.4591381637349, longitude: -73.64224416295825 },
        { latitude: 45.459163415786556, longitude: -73.642303074423 },
        { latitude: 45.45936084052782, longitude: -73.64214434075413 },
        { latitude: 45.45934017983147, longitude: -73.64208706571897 },
        { latitude: 45.45950661300357, longitude: -73.64195942421205 },
        { latitude: 45.45952727363896, longitude: -73.64200197138102 },
        { latitude: 45.45955826457781, longitude: -73.64197906136695 },
        { latitude: 45.459368875241005, longitude: -73.64149631464207 },
      ],
    },
    {
      name: "Hingston Hall, wing HC",
      boundaries: [
        { latitude: 45.459540431991925, longitude: -73.64201762469914 },
        { latitude: 45.45962697336985, longitude: -73.64224427135211 },
        { latitude: 45.45980475902837, longitude: -73.6421074786978 },
        { latitude: 45.45979347106671, longitude: -73.6420779743998 },
        { latitude: 45.45989412197836, longitude: -73.641998849237 },
        { latitude: 45.45983015693382, longitude: -73.6418325522847 },
        { latitude: 45.45972856524336, longitude: -73.64191033634305 },
        { latitude: 45.45971633660163, longitude: -73.6418794909406 },
      ],
    },
    {
      name: "Applied Science Hub",
      boundaries: [
        { latitude: 45.45829238873858, longitude: -73.64171908628015 },
        { latitude: 45.45844590809539, longitude: -73.64211875660926 },
        { latitude: 45.45872791538995, longitude: -73.64190226851431 },
        { latitude: 45.45857606548352, longitude: -73.64150497717526 },
      ],
    },
    {
      name: "Jesuit Residence",
      boundaries: [
        { latitude: 45.45846738431191, longitude: -73.64309715060635 },
        { latitude: 45.458396433612236, longitude: -73.6431539376945 },
        { latitude: 45.45842630760193, longitude: -73.64322758344944 },
        { latitude: 45.45841012585947, longitude: -73.64324178022149 },
        { latitude: 45.458450580206886, longitude: -73.64334115762574 },
        { latitude: 45.45846427244097, longitude: -73.64332784815196 },
        { latitude: 45.45849476876859, longitude: -73.64340149390688 },
        { latitude: 45.458558250867036, longitude: -73.64334825601175 },
        { latitude: 45.4585657193445, longitude: -73.64336334008205 },
        { latitude: 45.45863542508655, longitude: -73.64330744029215 },
        { latitude: 45.45860679595292, longitude: -73.64323556913371 },
        { latitude: 45.4586242223838, longitude: -73.64321959776517 },
        { latitude: 45.4585831457881, longitude: -73.64311933306266 },
        { latitude: 45.458570075955905, longitude: -73.64313086793995 },
        { latitude: 45.45853895729566, longitude: -73.6430554475885 },
        { latitude: 45.4584860555338, longitude: -73.64309803790461 },
        { latitude: 45.45848978977746, longitude: -73.64311223467665 },
        { latitude: 45.45847920941982, longitude: -73.64312110765917 },
      ],
    },
    {
      name: "Perform Center",
      boundaries: [
        { latitude: 45.4566832023212, longitude: -73.63698931998641 },
        { latitude: 45.45701184580415, longitude: -73.6378394869645 },
        { latitude: 45.457283900218435, longitude: -73.63762849661956 },
        { latitude: 45.4569465525494, longitude: -73.63677832964149 },
      ],
    },
    {
      name: "Physical Services Building",
      boundaries: [
        { latitude: 45.45929263659354, longitude: -73.63945158167996 },
        { latitude: 45.45934807931811, longitude: -73.63960088711397 },
        { latitude: 45.459411222354724, longitude: -73.63954819107845 },
        { latitude: 45.459454344387865, longitude: -73.63965138748136 },
        { latitude: 45.459431243302774, longitude: -73.63967993116728 },
        { latitude: 45.459623752055876, longitude: -73.64017395650043 },
        { latitude: 45.45964685306211, longitude: -73.64016078249155 },
        { latitude: 45.45971307589409, longitude: -73.64034521861592 },
        { latitude: 45.45986554211862, longitude: -73.64023323954041 },
        { latitude: 45.45999490707672, longitude: -73.64019810885006 },
        { latitude: 45.45994100504689, longitude: -73.64009491244713 },
        { latitude: 45.4599656459812, longitude: -73.64007295576566 },
        { latitude: 45.459677654389, longitude: -73.63933081993186 },
        { latitude: 45.4596360725937, longitude: -73.63936155928592 },
        { latitude: 45.45958371028939, longitude: -73.63922981919708 },
      ],
    },
    {
      name: "Oscar Peterson Concert Hall",
      boundaries: [
        { latitude: 45.45916334535203, longitude: -73.63878134145095 },
        { latitude: 45.459333969279335, longitude: -73.63922059274914 },
        { latitude: 45.45934956915549, longitude: -73.63920947246311 },
        { latitude: 45.45936126905978, longitude: -73.63923171303517 },
        { latitude: 45.45948411790827, longitude: -73.6391344105324 },
        { latitude: 45.459302769514046, longitude: -73.6386715286264 },
      ],
    },
    {
      name: "Psychology Building",
      boundaries: [
        { latitude: 45.45868128971848, longitude: -73.64055340303679 },
        { latitude: 45.45876218832274, longitude: -73.64077066195541 },
        { latitude: 45.458775357851984, longitude: -73.6407626153288 },
        { latitude: 45.45880922234163, longitude: -73.64083235275874 },
        { latitude: 45.45914222207318, longitude: -73.64064057482182 },
        { latitude: 45.45916385758092, longitude: -73.64062716377727 },
        { latitude: 45.45917796768832, longitude: -73.64063252818917 },
        { latitude: 45.45920618789627, longitude: -73.64061241162236 },
        { latitude: 45.459205247224475, longitude: -73.64059229505622 },
        { latitude: 45.459226882708, longitude: -73.64057486069834 },
        { latitude: 45.459062286300075, longitude: -73.6401549588718 },
        { latitude: 45.4589390576404, longitude: -73.64025285949694 },
        { latitude: 45.45892965086142, longitude: -73.64023408403459 },
        { latitude: 45.45869730292252, longitude: -73.64041915644925 },
        { latitude: 45.458701065649805, longitude: -73.64043122638934 },
        { latitude: 45.458668141777544, longitude: -73.64045804847841 },
        { latitude: 45.45869636224069, longitude: -73.64053583253676 },
        { latitude: 45.45867472655355, longitude: -73.64055192579019 },
      ],
    },
    {
      name: "Quadrangle",
      boundaries: [
        { latitude: 45.45896436784346, longitude: -73.64001082041777 },
        { latitude: 45.45882860088644, longitude: -73.63969282910347 },
        { latitude: 45.458355838395725, longitude: -73.64007649253703 },
        { latitude: 45.45849160649107, longitude: -73.64046361239791 },
      ],
    },
    {
      name: "Recreation and Athletics Complex",
      boundaries: [
        { latitude: 45.45700879547161, longitude: -73.63805322213418 },
        { latitude: 45.4569671204416, longitude: -73.63793779050737 },
        { latitude: 45.45702665637465, longitude: -73.6378732846784 },
        { latitude: 45.45672659291982, longitude: -73.63710770533105 },
        { latitude: 45.45639081189721, longitude: -73.63737082331309 },
        { latitude: 45.456693255052436, longitude: -73.63814488682492 },
        { latitude: 45.45679446621363, longitude: -73.6380617090055 },
        { latitude: 45.45684328538967, longitude: -73.63818393047657 },
      ],
    },
    {
      name: "Loyola Jesuit Hall and Conference Centre",
      boundaries: [
        { latitude: 45.45880734336593, longitude: -73.64116267777592 },
        { latitude: 45.45880313929571, longitude: -73.64114619532359 },
        { latitude: 45.45882205754365, longitude: -73.64112971281833 },
        { latitude: 45.45878527188797, longitude: -73.64103381498947 },
        { latitude: 45.45876530262416, longitude: -73.64103980869204 },
        { latitude: 45.45868122078816, longitude: -73.64080306143136 },
        { latitude: 45.45858978280713, longitude: -73.64087948060458 },
        { latitude: 45.45853933363022, longitude: -73.64075511381526 },
        { latitude: 45.45851410936677, longitude: -73.64077459322198 },
        { latitude: 45.45848888474339, longitude: -73.64071465750733 },
        { latitude: 45.458438436212646, longitude: -73.64075061950778 },
        { latitude: 45.45846260981112, longitude: -73.64081205358792 },
        { latitude: 45.45841321228881, longitude: -73.64085400904945 },
        { latitude: 45.45847101853633, longitude: -73.64100534673469 },
        { latitude: 45.458385886517405, longitude: -73.64108176521952 },
        { latitude: 45.45842687621125, longitude: -73.64120163671673 },
        { latitude: 45.45850885527525, longitude: -73.64113870394472 },
        { latitude: 45.45854564083223, longitude: -73.6412286077663 },
        { latitude: 45.45852356953718, longitude: -73.6412465885503 },
        { latitude: 45.45853618170673, longitude: -73.64128404849842 },
        { latitude: 45.458487835039136, longitude: -73.64131851160442 },
        { latitude: 45.45850675325511, longitude: -73.64137395232287 },
        { latitude: 45.45864548718566, longitude: -73.641281051743 },
        { latitude: 45.45880734336593, longitude: -73.64116267777592 },
        { latitude: 45.45880313929403, longitude: -73.64114469691926 },
        { latitude: 45.45882100652724, longitude: -73.64112971282141 },
      ],
    },
    {
      name: "Student Center",
      point: {
        latitude:45.45860551720628, longitude:-73.64103623036401 
      },
      departments: ["Cafe","Campus Centre"  ],
      address: "7141 Sherbrooke St W",
      boundaries: [
        { latitude: 45.45918653124292, longitude: -73.63935394855122 },
        { latitude: 45.45907882296455, longitude: -73.63905421166972 },
        { latitude: 45.458991340429854, longitude: -73.63912462029388 },
        { latitude: 45.45910704413579, longitude: -73.63941765094647 },
      ],
    },
    {
      name: "Solar House",
      point: {
        latitude:45.45928142821381, longitude:-73.64253871077227
      },
      address: "7141 Sherbrooke W",
      boundaries: [
        { latitude: 45.45933420269998, longitude: -73.64265845517272 },
        { latitude: 45.45933081688494, longitude: -73.64239744701572 },
        { latitude: 45.45921128868546, longitude: -73.64239126104339 },
        { latitude: 45.45921427594952, longitude: -73.64266684063757 },
      ],
    },
    {
      name: "Saint Ignatius of Loyola Catholic Church",
      point: {
        latitude:45.457903577882405, longitude:-73.642292915826
      },
      address:"4455 Broadway",
      boundaries: [
        { latitude: 45.45816640264312, longitude: -73.64252315784637 },
        { latitude: 45.45811784212762, longitude: -73.64240039852407 },
        { latitude: 45.458099819715564, longitude: -73.64241253176102 },
        { latitude: 45.45804425031929, longitude: -73.64226978862908 },
        { latitude: 45.45805526394357, longitude: -73.64223767132232 },
        { latitude: 45.45799368754668, longitude: -73.64208136772642 },
        { latitude: 45.45796915699926, longitude: -73.64207922667075 },
        { latitude: 45.45794012067459, longitude: -73.64200357291013 },
        { latitude: 45.457878043481465, longitude: -73.6420499646957 },
        { latitude: 45.45785651654545, longitude: -73.64199857731835 },
        { latitude: 45.45782397607934, longitude: -73.6420228437677 },
        { latitude: 45.45783248674179, longitude: -73.6420485374508 },
        { latitude: 45.457765903361114, longitude: -73.64210420673342 },
        { latitude: 45.45777591593942, longitude: -73.64213418276111 },
        { latitude: 45.45772034665826, longitude: -73.64218057453093 },
        { latitude: 45.45772885732736, longitude: -73.64220269967639 },
        { latitude: 45.45764625432743, longitude: -73.64230190625814 },
        { latitude: 45.45764174869142, longitude: -73.64229262798115 },
        { latitude: 45.45763323807105, longitude: -73.64229976513869 },
        { latitude: 45.45763974621498, longitude: -73.64231760798177 },
        { latitude: 45.457622724971756, longitude: -73.64233330971415 },
        { latitude: 45.457569658430245, longitude: -73.64239540303662 },
        { latitude: 45.457639245482774, longitude: -73.642577400265 },
        { latitude: 45.45772885751654, longitude: -73.64251031102101 },
        { latitude: 45.45773836940714, longitude: -73.64253457737773 },
        { latitude: 45.45777892009921, longitude: -73.64250246012485 },
        { latitude: 45.45779393887628, longitude: -73.64253314995763 },
        { latitude: 45.45784550311135, longitude: -73.64249460922755 },
        { latitude: 45.457738870036096, longitude: -73.64253314995908 },
        { latitude: 45.45778042188677, longitude: -73.6425017464565 },
        { latitude: 45.45779293751856, longitude: -73.64253314993655 },
        { latitude: 45.45784400123653, longitude: -73.64249389551283 },
        { latitude: 45.45785451436865, longitude: -73.64251816186213 },
        { latitude: 45.45789406372094, longitude: -73.64249104058611 },
        { latitude: 45.4579641509631, longitude: -73.64268160281158 },
      ],
    },
    {
      name: "Richard J Renaud Science Complex",
      point: {
        latitude:45.45752302066854,longitude: -73.64163335665545
      },
      address: "7141 Sherbrooke St W",
      departments: ["Biology","Centre for Spectrometry"],
      boundaries: [
        { latitude: 45.458326098999855, longitude: -73.64141277416134 },
        { latitude: 45.45819394999942, longitude: -73.64104205802843 },
        { latitude: 45.458341016572575, longitude: -73.64092050902703 },
        { latitude: 45.45831970203752, longitude: -73.64085973589846 },
        { latitude: 45.45799359795347, longitude: -73.64111194976012 },
        { latitude: 45.45797867782236, longitude: -73.64106333149957 },
        { latitude: 45.4578955533052, longitude: -73.64113322146376 },
        { latitude: 45.45790621054382, longitude: -73.64117272376673 },
        { latitude: 45.457526821201576, longitude: -73.64147355177992 },
        { latitude: 45.457204973474205, longitude: -73.64065920545207 },
        { latitude: 45.45698970263023, longitude: -73.6408263325392 },
        { latitude: 45.45702167467389, longitude: -73.64093268318057 },
        { latitude: 45.45699669377517, longitude: -73.64095897012349 },
        { latitude: 45.45701644875199, longitude: -73.64101261417416 },
        { latitude: 45.45704137750493, longitude: -73.64099450920898 },
        { latitude: 45.457159436473624, longitude: -73.64129424595949 },
        { latitude: 45.45714861835243, longitude: -73.64130430426238 },
        { latitude: 45.45717919138829, longitude: -73.64138342936369 },
        { latitude: 45.45716837325802, longitude: -73.64139147599617 },
        { latitude: 45.45718530599103, longitude: -73.6414323796756 },
        { latitude: 45.45720882366897, longitude: -73.64141293365591 },
        { latitude: 45.457438161368685, longitude: -73.64200343083267 },
        { latitude: 45.45764070855774, longitude: -73.64184511371828 },
        { latitude: 45.45767342207378, longitude: -73.6419260008635 },
      ],
    },
];

const createBuildingNames = () => {
    const names = []
    for (let i = 0; i < polygons.length; i++) {
        names.push(polygons[i].name);
    }
    return names;
}



export const building_names = createBuildingNames()