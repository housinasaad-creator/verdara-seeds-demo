/*
  The crop table of the demo catalogue: 170+ crops in 11 broad groups, each with a few invented varieties.
  One crop per line, fields separated by "|":
  id | group | emblem | fruit colour | leaf colour (- = group default) | sowing profile | season | days (or years x 365) |
  growing (f field, g greenhouse) | hybrid (h mostly F1, m mixed, o open-pollinated) | pack set |
  Turkish | English | French | Arabic | varieties (comma separated) | extra trait tags (optional)
  Everything here is placeholder content for the concept demo.
*/
export const ROWS = `
lettuce|leafy|lettuce|8fd14f|-|lf|cool|55|fg|m|leaf|Marul|Lettuce|Laitue|خس|Verde Crispa,Burro Soft,Rossa Riccia,Lollo Fine|
romaine|leafy|lettuce|6fbf4a|-|lf|cool|60|fg|m|leaf|Romen marulu|Romaine lettuce|Laitue romaine|خس روماني|Romana Alta,Cuore Lungo,Caesar Prima|
iceberg|leafy|lettuce|b4dd7a|-|lf|cool|75|f|h|leaf|Iceberg (buz) marul|Iceberg lettuce|Laitue iceberg|خس آيسبرغ|Polare Bianca,Gelo Crisp,Montana Dense|
spinach|leafy|spinach|3f9e4a|2f7d3a|lf|cool|42|f|m|leaf|Ispanak|Spinach|Épinard|سبانخ|Foglia Scura,Primo Verde,Baby Velluto|
rocket|leafy|rocket|6fbf4a|4a9a37|sm|cool|35|fg|o|leaf|Roka|Rocket|Roquette|جرجير|Rucola Piccante,Selvatica Fine,Foglia Larga|
chard|leafy|spinach|c0392b|2f7d3a|lf|cool|55|fg|o|leaf|Pazı|Swiss chard|Blette|سلق|Costa Bianca,Rainbow Luce,Rubino Verde|
endive|leafy|lettuce|c8e07a|-|lf|cool|70|f|o|leaf|Hindiba (endivya)|Endive|Chicorée|هندباء|Riccia Pallida,Scarola Piena|
radicchio|leafy|head|a8324a|-|lf|cool|80|f|m|leaf|Radiçyo|Radicchio|Radicchio|راديكيو|Treviso Rosso,Chioggia Tonda,Palla Scarlatta|
cress|leafy|rocket|7ac84a|-|sm|cool|25|fg|o|leaf|Tere|Garden cress|Cresson alénois|رشاد|Berro Veloce,Fine Riccio|
purslane|leafy|basil|5aa04a|-|sm|warm|45|f|o|leaf|Semizotu|Purslane|Pourpier|رجلة|Verdolaga Dorata,Foglia Carnosa|
mallow|leafy|spinach|5a9a4a|-|lf|cool|55|f|o|leaf|Ebegümeci|Mallow|Mauve|خبيزة|Malva Anatolica,Foglia Tonda|heritage
sorrel|leafy|spinach|7ab83a|-|lf|cool|60|f|o|leaf|Kuzukulağı|Sorrel|Oseille|حماض|Acetosa Verde,Sanguigna Fine|
mustardgreens|leafy|rocket|4f9a3a|-|lf|cool|40|fg|o|leaf|Hardal yeşilliği|Mustard greens|Moutarde (feuilles)|خردل ورقي|Senape Rossa,Foglia Riccia|
celery|leafy|parsley|6fae3a|3a8a3a|sm|cool|110|fg|m|leaf|Kereviz (yaprak ve sap)|Celery|Céleri|كرفس|Sedano Dorato,Costa Verde,Foglia Fine|
cabbage|brassica|head|9bd08a|-|br|cool|85|f|h|leaf|Beyaz lahana|White cabbage|Chou blanc|ملفوف أبيض|Testa Piena,Palla Bianca,Kaiser Tardivo|
redcabbage|brassica|head|8a3a7a|-|br|cool|90|f|h|leaf|Kırmızı lahana|Red cabbage|Chou rouge|ملفوف أحمر|Rubino Scuro,Porpora Fine|
savoy|brassica|head|6fae5a|-|br|cool|88|f|m|leaf|Kıvırcık lahana|Savoy cabbage|Chou de Milan|ملفوف مجعد|Verza Crespa,Milano Verde|
cauliflower|brassica|floret|f2efe0|-|br|cool|80|f|h|leaf|Karnabahar|Cauliflower|Chou-fleur|قرنبيط|Neve Candida,Bianca Piena,Stella Alpina|
broccoli|brassica|floret|4f9f45|-|br|cool|75|f|h|leaf|Brokoli|Broccoli|Brocoli|بروكلي|Verde Corona,Calabrese Prima,Cima Scura|
romanesco|brassica|floret|9fd15a|-|br|cool|85|f|o|leaf|Romanesko|Romanesco|Chou romanesco|رومانيسكو|Spirale Verde,Cono Dorato|
kale|brassica|parsley|2f6f3a|1f5f2a|br|cool|65|f|o|leaf|Karalahana|Kale|Chou frisé|كيل|Cavolo Nero,Riccio Verde,Baltico Fine|
kohlrabi|brassica|beet|b8d89a|3a8a3a|br|cool|55|fg|o|leaf|Alabaş|Kohlrabi|Chou-rave|كرنب سلجمي|Rapa Chiara,Viola Tonda|
brussels|brassica|head|5fa04a|-|br|cool|120|f|o|leaf|Brüksel lahanası|Brussels sprouts|Chou de Bruxelles|كرنب بروكسل|Piccolo Verde,Torre Fitta|
chinese|brassica|lettuce|cfe39a|-|br|cool|60|f|m|leaf|Çin lahanası|Chinese cabbage|Chou chinois|ملفوف صيني|Pechino Alto,Napa Dolce,Cuore Giallo|
pakchoi|brassica|spinach|8fd05a|2f7d3a|lf|cool|45|fg|o|leaf|Pak choi|Pak choi|Pak-choï|باك تشوي|Mini Jade,Gambo Bianco|
tomato|fruitveg|tomato|e0392c|2f8f4e|fv|warm|72|fg|h|veg|Domates|Tomato|Tomate|طماطم|Rosso Pieno,Sole Grande,Aurora Beef,Terra Antica|
cherry|fruitveg|cherry|e8453a|2f8f4e|fv|warm|65|fg|h|veg|Kokteyl domates|Cherry tomato|Tomate cerise|طماطم كرزية|Nova Cherry,Perla Rosa,Dolce Grappolo|
plum|fruitveg|plum|c9302b|2f8f4e|fv|warm|90|f|h|veg|Salçalık domates|Processing tomato|Tomate de transformation|طماطم للتصنيع|Pera Industria,Verdara Pasta,Bruna Densa|
sweetpepper|fruitveg|sweetpepper|f2862a|2f8f4e|fv|warm|70|fg|h|veg|Tatlı biber|Sweet pepper|Poivron doux|فلفل حلو|Dolce Corno,Campana Rossa,Giallo Sole|
bellpepper|fruitveg|sweetpepper|d92d20|2f8f4e|fv|warm|80|g|h|veg|Dolma biber|Bell pepper|Poivron|فلفل رومي|Blocco Rosso,Cubo Dorato,Verde Pieno|
sivri|fruitveg|chili|5fa83a|2f8f4e|fv|warm|70|fg|m|veg|Sivri biber|Long green pepper|Piment long vert|فلفل أخضر طويل|Sivri Gold,Çarliston Fine,Kemer Lungo|heritage
chili|fruitveg|chili|d92d20|2f8f4e|fv|warm|75|fg|h|veg|Acı biber|Hot pepper|Piment fort|فلفل حار|Fuoco Lungo,Diavola Rossa,Pul Biber Dark|
eggplant|fruitveg|eggplant|5b2a86|2f8f4e|fv|warm|68|fg|h|veg|Patlıcan|Eggplant|Aubergine|باذنجان|Viola Lunga,Kemer Dark,Bianca Perla|
cucumber|fruitveg|cucumber|2f9e5b|237a46|cu|warm|45|fg|h|veg|Salatalık|Cucumber|Concombre|خيار|Verdino,Snack Mini,Campo Lungo,Beit Alpha Prima|
gherkin|fruitveg|cucumber|3f8f3a|237a46|cu|warm|50|fg|h|veg|Kornişon|Gherkin|Cornichon|خيار مخلل|Cetriolo Piccolo,Salamoia Verde|pickling
zucchini|fruitveg|zucchini|4aa35a|237a46|cu|warm|40|fg|h|veg|Kabak (sakız)|Zucchini|Courgette|كوسا|Chiara,Scura Perla,Striata Bella|
pumpkin|fruitveg|pumpkin|e8892b|237a46|cu|warm|105|f|o|veg|Balkabağı|Pumpkin|Potiron|قرع|Zucca Dorata,Halloween Tonda,Grande Arancio|
butternut|fruitveg|pear|e0b070|237a46|cu|warm|100|f|m|veg|Bal kabağı (butternut)|Butternut squash|Courge butternut|قرع بتر نت|Burro Dolce,Noce Fine,Colonna Beige|
okra|fruitveg|pod|5fa84a|3a8a3a|fv|warm|60|f|o|veg|Bamya|Okra|Gombo|بامية|Bamya Sultan,Piccola Verde,Dita Lunghe|
sweetcorn|fruitveg|corn|f2c230|4a9a37|mz|warm|85|f|h|veg|Tatlı mısır|Sweet corn|Maïs doux|ذرة سكرية|Dolce Spiga,Bicolore Prima,Zucchero Oro|
bottlegourd|fruitveg|zucchini|a8d08a|237a46|cu|warm|75|f|o|veg|Su kabağı|Bottle gourd|Calebasse|دباء (قرع قنينة)|Fiasca Lunga,Lagenaria Verde|
melon|fruits|melon|e9c46a|2f8f4e|cu|warm|85|f|h|veg|Kavun|Melon|Melon|شمام|Miele Oro,Kırkağaç Late,Cantalupo Net|heritage
cantaloupe|fruits|melon|f0a050|2f8f4e|cu|warm|80|fg|h|veg|Kantalup|Cantaloupe|Cantaloup|كانتالوب|Arancio Dolce,Charentais Fine,Rete Aurea|
galia|fruits|melon|b5d17a|2f8f4e|cu|warm|82|fg|h|veg|Galia kavunu|Galia melon|Melon Galia|شمام غاليا|Galia Perla,Verde Miele|
watermelon|fruits|watermelon|2f8a4a|237a46|cu|warm|78|f|h|veg|Karpuz|Watermelon|Pastèque|بطيخ|Rubino Crimson,Mini Sugar,Tavola Verde,Crimson Lungo|
seedlesswm|fruits|watermelon|2a7a5a|237a46|cu|warm|85|f|h|veg|Çekirdeksiz karpuz|Seedless watermelon|Pastèque sans pépins|بطيخ بدون بذور|Zero Seme,Nettare Rosso,Cubo Senza|seedless
strawberry|fruits|berry|d92d3a|3a8a3a|st|cool|120|fg|o|veg|Çilek|Strawberry|Fraise|فراولة|Fragola Regina,Aurora Rossa,Alba Dolce|
physalis|fruits|cherry|f0a030|3a8a3a|fv|warm|100|f|o|veg|Altın çilek (fizalis)|Golden berry|Physalis|فيزاليس|Lanterna Oro,Piccolo Sole|
passion|fruits|apple|6a3a8a|3a8a3a|fv|warm|365|fg|o|tree|Çarkıfelek meyvesi|Passion fruit|Fruit de la passion|فاكهة العاطفة|Maracuja Viola,Fiore Nobile|
pomegranate|fruits|pomegranate|c0302f|3a8a3a|tr|tree|1095|f|o|tree|Nar|Pomegranate|Grenade|رمان|Hicaz Rubino,Granato Dolce,Ekşi Nar Fine|rootstock
fig|fruits|pear|6a3a5a|3a8a3a|tr|tree|730|f|o|tree|İncir|Fig|Figue|تين|Sarılop Dorata,Fico Nero,Bursa Viola|rootstock
grape|fruits|grape|6f4a9a|3a8a3a|tr|tree|730|f|o|tree|Üzüm|Grape|Raisin|عنب|Uva Reale,Sultana Chiara,Narince Fine|rootstock
apricot|fruits|apple|f5a742|3a8a3a|tr|tree|1095|f|o|tree|Kayısı|Apricot|Abricot|مشمش|Malatya Oro,Albicocca Tardiva,Hacıhaliloğlu Fine|rootstock
peach|fruits|apple|f4a58a|3a8a3a|tr|tree|1095|f|o|tree|Şeftali|Peach|Pêche|خوخ|Pesca Velluto,Nettarina Rossa,Pesca Bianca|rootstock
sweetcherry|fruits|cherry|a8142a|3a8a3a|tr|tree|1460|f|o|tree|Kiraz|Sweet cherry|Cerise|كرز|Ciliegia Nera,Bing Scura|rootstock
sourcherry|fruits|cherry|d92d2d|3a8a3a|tr|tree|1460|f|o|tree|Vişne|Sour cherry|Griotte|كرز حامض|Visciola Rossa,Amarena Fine|rootstock
apple|fruits|apple|d63a3a|3a8a3a|tr|tree|1460|f|o|tree|Elma|Apple|Pomme|تفاح|Amasya Rossa,Mela Dolce,Golden Verde|rootstock
pear|fruits|pear|b5c94a|3a8a3a|tr|tree|1825|f|o|tree|Armut|Pear|Poire|إجاص (كمثرى)|Santa Maria,Pera Burro,Ankara Fine|rootstock
plumtree|fruits|apple|6a3a7a|3a8a3a|tr|tree|1095|f|o|tree|Erik|Plum|Prune|برقوق|Prugna Viola,Can Eriği Gold|rootstock
quince|fruits|pear|e8d04a|3a8a3a|tr|tree|1460|f|o|tree|Ayva|Quince|Coing|سفرجل|Cotogna Oro,Ayva Bursa|rootstock
mulberry|fruits|berry|3a2a4a|3a8a3a|tr|tree|1095|f|o|tree|Dut|Mulberry|Mûre|توت|Gelso Nero,Dut Beyaz Fine|
kiwi|fruits|apple|9a7a4a|3a8a3a|tr|tree|1095|f|o|tree|Kivi|Kiwi|Kiwi|كيوي|Actinidia Verde,Kiwi Dorato|
lemon|fruits|citrus|f0d030|3a8a3a|tr|tree|1460|f|o|tree|Limon|Lemon|Citron|ليمون|Limone Sole,Interdonato Fine|rootstock
orange|fruits|citrus|f28a1c|3a8a3a|tr|tree|1825|f|o|tree|Portakal|Orange|Orange|برتقال|Arancia Dolce,Washington Navel|rootstock
mandarin|fruits|citrus|f5961f|3a8a3a|tr|tree|1460|f|o|tree|Mandalina|Mandarin|Mandarine|يوسفي|Clementina Fine,Satsuma Prima|rootstock
avocado|fruits|pear|3a5a2a|3a8a3a|tr|tree|1460|f|o|tree|Avokado|Avocado|Avocat|أفوكادو|Hass Scuro,Fuerte Verde|rootstock
mango|fruits|pear|f0a030|3a8a3a|tr|tree|1460|f|o|tree|Mango|Mango|Mangue|مانجو|Mango Oro,Kent Rossa|rootstock
persimmon|fruits|apple|f07a20|3a8a3a|tr|tree|1460|f|o|tree|Hurma|Persimmon|Kaki|كاكا|Kaki Arancio,Trabzon Dolce|rootstock
loquat|fruits|apple|f0b030|3a8a3a|tr|tree|1095|f|o|tree|Yenidünya (malta eriği)|Loquat|Nèfle du Japon|أكي دنيا|Nespola Oro,Akko Fine|
olive|fruits|plum|6a7a3a|3a8a3a|tr|tree|1460|f|o|tree|Zeytin|Olive|Olive|زيتون|Memecik Verde,Ayvalık Nera,Oliva Prima|rootstock,heritage
hazelnut|fruits|nut|a8743a|3a8a3a|tr|tree|1825|f|o|tree|Fındık|Hazelnut|Noisette|بندق|Tombul Oro,Nocciola Fine,Giresun Prima|heritage
pistachio|fruits|nut|9fb86a|3a8a3a|tr|tree|2555|f|o|tree|Antep fıstığı|Pistachio|Pistache|فستق حلبي|Siirt Verde,Pistacchio Rosso,Antep Prima|heritage
walnut|fruits|nut|b08a5a|3a8a3a|tr|tree|2190|f|o|tree|Ceviz|Walnut|Noix|جوز|Noce Reale,Chandler Fine,Bilecik Prima|
almond|fruits|nut|c9a070|3a8a3a|tr|tree|1095|f|o|tree|Badem|Almond|Amande|لوز|Mandorla Dolce,Nonpareil Fine|
chestnut|fruits|nut|6a3a1f|3a8a3a|tr|tree|2190|f|o|tree|Kestane|Chestnut|Châtaigne|كستناء|Castagna Bruna,Marrone Grande|
carrot|roots|carrot|ee7a1c|3f9e3a|rt|cool|95|f|m|leaf|Havuç|Carrot|Carotte|جزر|Arancio Lungo,Nantes Dolce,Viola Antica|
beet|roots|beet|8a1f4a|3f9e3a|rt|cool|70|f|m|leaf|Pancar (kırmızı)|Beetroot|Betterave rouge|شمندر|Rubino Tondo,Detroit Scura,Cilindra Lunga|
radish|roots|radish|d63b5a|3f9e3a|sm|cool|28|fg|o|leaf|Turp|Radish|Radis|فجل|Rapa Rosa,Bianca Lunga,Ciliegia Fine|
turnip|roots|radish|f0ece0|3f9e3a|rt|cool|55|f|o|leaf|Şalgam|Turnip|Navet|لفت|Navone Bianco,Viola Sera,Rapa Dolce|
parsnip|roots|carrot|efe3c0|3f9e3a|rt|cool|130|f|o|leaf|Yaban havucu|Parsnip|Panais|جزر أبيض|Pastinaca Lunga,Bianca Fine|
celeriac|roots|beet|c8b88a|3a8a3a|rt|cool|120|f|o|leaf|Kereviz kökü|Celeriac|Céleri-rave|كرفس جذري|Sedano Rapa,Palla Beige|
potato|roots|potato|c9a06a|3a8a3a|po|cool|110|f|o|field|Patates (tohumluk)|Potato (seed tubers)|Pomme de terre (plants)|بطاطا (درنات للزراعة)|Patata Dorata,Rossa Piena,Niğde Prima|
sweetpotato|roots|potato|c0603a|3a8a3a|po|warm|120|f|o|field|Tatlı patates|Sweet potato|Patate douce|بطاطا حلوة|Batata Arancio,Viola Dolce|
jerusalem|roots|potato|c0a070|3a8a3a|po|cool|150|f|o|field|Yer elması|Jerusalem artichoke|Topinambour|طرطوفة|Topinambo Bianco,Yer Elması Fine|heritage
onion|roots|onion|d9a441|4a9a37|bu|cool|150|f|m|leaf|Soğan|Onion|Oignon|بصل|Cipolla Dorata,Rossa Tonda,Bianca Dolce|
springonion|roots|leek|e8f0d0|4a9a37|bu|cool|70|fg|o|leaf|Taze soğan|Spring onion|Oignon nouveau|بصل أخضر|Cipollotto Bianco,Verde Lungo|
leek|roots|leek|e8f0d0|3a8a4a|bu|cool|120|f|m|leaf|Pırasa|Leek|Poireau|كراث|Porro Lungo,Gigante Invernale,Bianca Fusto|
garlic|roots|onion|f0ebe0|4a9a37|bu|cool|210|f|o|field|Sarımsak|Garlic|Ail|ثوم|Aglio Bianco,Taşköprü Prima,Rosa Forte|heritage
shallot|roots|onion|b06a4a|4a9a37|bu|cool|100|f|o|field|Arpacık soğan|Shallot|Échalote|بصل شالوت|Scalogno Rame,Grigio Fine|
wheat|cereals|wheat|d4a94a|8aa03a|ce|winter|210|f|o|field|Ekmeklik buğday|Bread wheat|Blé tendre|قمح طري|Campo Sole,Verdara Grano 7,Ova Gold|breadQ
durum|cereals|wheat|e0b24a|8aa03a|ce|winter|195|f|o|field|Makarnalık buğday|Durum wheat|Blé dur|قمح قاسي|Duro Aureo,Semola Prima,Kızıltan Fine|
barley|cereals|barley|c8a04e|8aa03a|ce|winter|180|f|o|field|Arpa|Barley|Orge|شعير|Orzo Forte,Malta Chiara,Sei File|
oat|cereals|panicle|d8c890|8aa03a|ce|winter|170|f|o|field|Yulaf|Oat|Avoine|شوفان|Avena Chiara,Fiocco Dorato|
rye|cereals|barley|a89a6a|8aa03a|ce|winter|220|f|o|field|Çavdar|Rye|Seigle|جاودار|Segale Scura,Foraggio Alto|
triticale|cereals|wheat|c9a45a|8aa03a|ce|winter|200|f|o|field|Tritikale|Triticale|Triticale|تريتيكالي|Tritico Rosso,Duale Forte|
corn|cereals|corn|f2c230|4a9a37|mz|warm|120|f|h|field|Dane mısır|Grain maize|Maïs grain|ذرة (حبوب)|Mais Oro,Spiga Piena,Dente Alto|
rice|cereals|panicle|d8c060|8aa03a|ri|warm|140|f|o|field|Çeltik (pirinç)|Rice (paddy)|Riz (paddy)|أرز (شلب)|Riso Perla,Osmancık Fine,Baldo Chiaro|
sorghum|cereals|panicle|b04a2a|8aa03a|mz|warm|110|f|h|field|Sorgum|Sorghum|Sorgho|ذرة رفيعة|Sorgo Rosso,Granella Alta|
millet|cereals|panicle|d8b04a|8aa03a|ol|warm|90|f|o|field|Darı|Millet|Millet|دخن|Miglio Oro,Darı Fine|
buckwheat|cereals|blossom5|e8c0c0|4a9a37|ol|warm|85|f|o|field|Karabuğday|Buckwheat|Sarrasin|حنطة سوداء|Grano Nero,Fior Bianco|
quinoa|cereals|panicle|a83a5a|4a9a37|ol|warm|120|f|o|field|Kinoa|Quinoa|Quinoa|كينوا|Quinoa Rosa,Altipiano Chiara|
spelt|cereals|wheat|caa04a|8aa03a|ce|winter|220|f|o|field|Spelta buğdayı|Spelt|Épeautre|قمح إسبلت|Farro Grande,Spelta Antica|heritage
einkorn|cereals|wheat|d0a860|8aa03a|ce|winter|230|f|o|field|Siyez (einkorn)|Einkorn|Engrain|قمح أحادي الحبة (سيّز)|Siyez Kastamonu,Piccolo Farro|heritage
emmer|cereals|barley|c8a060|8aa03a|ce|winter|225|f|o|field|Gernik (emmer)|Emmer|Amidonnier|قمح إيمر (جرنيك)|Gernik Antico,Farro Medio|heritage
chickpea|legumes|chickpea|d8b878|6fa24a|lg|cool|120|f|o|field|Nohut|Chickpea|Pois chiche|حمص|Cece Grande,Kabuli Fine,Desi Scuro|
lentilred|legumes|lentil|c0562f|6fa24a|lg|winter|100|f|o|field|Kırmızı mercimek|Red lentil|Lentille corail|عدس أحمر|Lenticchia Rossa,Corallo Fine|
lentilgreen|legumes|lentil|7a8a4a|6fa24a|lg|winter|105|f|o|field|Yeşil mercimek|Green lentil|Lentille verte|عدس أخضر|Verde Piccola,Puy Chiara|
drybean|legumes|bean|e8dcc0|3f8f3a|lg|warm|90|f|o|field|Kuru fasulye|Dry bean|Haricot sec|فاصولياء جافة|Fagiolo Bianco,Dermason Prima,Nano Pieno|fastCook
snapbean|legumes|bean|5aa84a|3f8f3a|lg|warm|55|fg|o|veg|Taze fasulye|Green bean|Haricot vert|فاصولياء خضراء|Fagiolo Verde,Stringa Zero,Corno Lungo|
barbunya|legumes|bean|b02a3a|3f8f3a|lg|warm|85|f|o|field|Barbunya|Borlotti bean|Haricot borlotti|فاصولياء بورلوتي|Borlotto Rosso,Barbunya Scura|
broadbean|legumes|pod|7ab04a|3f8f3a|lg|winter|120|f|o|field|Bakla|Broad bean|Fève|فول|Fava Grande,Aguadulce Fine|
pea|legumes|pod|6fbf4a|3f8f3a|lg|cool|65|fg|o|veg|Bezelye|Garden pea|Petit pois|بازلاء|Pisello Dolce,Nano Verde,Mangiatutto Fine|
fieldpea|legumes|pod|c8b860|3f8f3a|lg|winter|110|f|o|field|Yemlik bezelye|Field pea|Pois protéagineux|بازلاء حقلية|Pisello Campo,Forte Proteico|
cowpea|legumes|pod|a08a4a|3f8f3a|lg|warm|80|f|o|field|Börülce|Cowpea|Niébé|لوبيا|Fagiolo Occhio,Börülce Lungo|
mung|legumes|lentil|5a9a3a|3f8f3a|lg|warm|70|f|o|field|Maş fasulyesi|Mung bean|Haricot mungo|فاصولياء مونج|Mungo Verde,Germoglio Fine|
soybean|legumes|pod|b8a050|3f8f3a|lg|warm|120|f|o|field|Soya fasulyesi|Soybean|Soja|فول الصويا|Soia Alta,Proteina Oro|
peanut|legumes|peanut|d2a96a|3f8f3a|lg|warm|130|f|o|field|Yer fıstığı|Peanut|Arachide|فول سوداني|Arachide Grande,Osmaniye Fine|
lupin|legumes|pod|c8b090|3f8f3a|lg|cool|140|f|o|field|Acı bakla (lüpen)|Lupin|Lupin|ترمس|Lupino Dolce,Acı Bakla Prima|
sunflower|oil|sunflower|f0b21a|4a9a37|ol|warm|105|f|h|field|Ayçiçeği|Sunflower|Tournesol|عباد الشمس|Girasole Alto,Snack Nera,Oleico Forte|
canola|oil|blossom4|f2d020|4a9a37|ol|winter|240|f|h|field|Kanola|Canola|Colza|كانولا|Colza Oro,Inverno Fine|
safflower|oil|daisy|f0902a|4a9a37|ol|cool|150|f|o|field|Aspir|Safflower|Carthame|عصفر|Aspro Giallo,Fiore Ardente|
sesame|oil|poppyhead|d8c8a0|4a9a37|ol|warm|100|f|o|field|Susam|Sesame|Sésame|سمسم|Sesamo Chiaro,Susam Dore|
flax|oil|blossom5|5a8ad0|4a9a37|ol|cool|100|f|o|field|Keten tohumu|Flax|Lin|كتان|Lino Azzurro,Fibra Lunga|
cotton|oil|cotton|f4f1e8|4a9a37|ol|warm|165|f|m|field|Pamuk|Cotton|Coton|قطن|Fiocco Bianco,Lana Fine,Çukurova Prima|fibre
sugarbeet|oil|beet|d8c8a0|3f9e3a|rt|cool|180|f|h|field|Şeker pancarı|Sugar beet|Betterave sucrière|شمندر سكري|Zucchero Bianco,Radice Dolce|sugar
mustard|oil|blossom4|e8c020|4a9a37|ol|cool|90|f|o|field|Hardal|Mustard|Moutarde|خردل|Senape Gialla,Seme Piccante|
tea|oil|sprig|3f8f4a|2f7d3a|tr|tree|1095|f|o|tree|Çay|Tea|Thé|شاي|Rize Verde,Camelia Fine|heritage
alfalfa|forage|clover|6a4a9a|4a9a3a|fo|cool|80|f|o|field|Yonca|Alfalfa|Luzerne|برسيم حجازي (فصة)|Medica Alta,Erba Viola,Multitaglio Plus|nFix
clover|forage|clover|d04a8a|4a9a3a|fo|cool|85|f|o|field|Üçgül (kırmızı)|Red clover|Trèfle violet|برسيم|Trifoglio Rosso,Prato Dolce|nFix
vetch|forage|pod|8a6aaa|4a9a3a|lg|winter|120|f|o|field|Fiğ|Vetch|Vesce|بيقية|Veccia Comune,Fiore Porpora|nFix
sainfoin|forage|spike|d85a8a|4a9a3a|fo|cool|90|f|o|field|Korunga|Sainfoin|Sainfoin|إسبرسة|Lupinella Rosa,Korunga Fine|nFix
ryegrass|forage|grass|6fae3a|4a9a3a|fo|cool|70|f|o|field|İtalyan çimi|Italian ryegrass|Ray-grass d'Italie|رايغراس إيطالي|Loglio Veloce,Prato Verde|
fescue|forage|grass|4f9a4a|4a9a3a|fo|cool|90|f|o|field|Kamışsı yumak|Tall fescue|Fétuque élevée|فستوكة|Festuca Alta,Pascolo Forte|
orchardgrass|forage|grass|8abf5a|4a9a3a|fo|cool|90|f|o|field|Domuz ayrığı|Orchard grass|Dactyle|دكتيلس|Dattilo Fine,Erba Frutteto|
sudan|forage|panicle|a89a3a|4a9a3a|mz|warm|70|f|h|field|Sudan otu|Sudan grass|Herbe du Soudan|حشيشة السودان|Sudano Alto,Foraggio Caldo|
silagecorn|forage|corn|d8c040|4a9a37|mz|warm|130|f|h|field|Silajlık mısır|Silage maize|Maïs fourrage|ذرة علفية (سيلاج)|Silo Verde,Foraggio Mais,Massa Alta|silage
foddernavet|forage|beet|d0a0c0|3f9e3a|rt|cool|80|f|o|field|Yem şalgamı|Fodder turnip|Navet fourrager|لفت علفي|Rapa Foraggio,Navone Viola|
phacelia|forage|spike|8a7ad8|4a9a3a|fo|warm|60|f|o|field|Arı otu (fasilya)|Phacelia|Phacélie|فاسيليا|Fasellia Blu,Ape Fiore|beeFriendly
basil|herbs|basil|3f9e4a|2f7d3a|hb|warm|50|fg|o|herb|Fesleğen|Basil|Basilic|ريحان|Genovese Verde,Rosso Opale,Foglia Lattuga|
parsley|herbs|parsley|4fae4a|3a8a38|hb|cool|70|fg|o|herb|Maydanoz|Parsley|Persil|بقدونس|Prezzemolo Riccio,Foglia Liscia,Gigante Italia|
coriander|herbs|coriander|5aa84a|3f8f3a|hb|cool|45|fg|o|herb|Kişniş|Coriander|Coriandre|كزبرة|Coriandolo Fine,Leaf Plus,Seme Oro|
dill|herbs|sprig|9fc05a|4a9a3a|hb|cool|45|fg|o|herb|Dereotu|Dill|Aneth|شبت|Aneto Soffice,Verde Piuma|
mint|herbs|sprig|3f9e5a|2f8f4e|hb|warm|80|fg|o|herb|Nane|Mint|Menthe|نعناع|Menta Fresca,Piperita Scura|
thyme|herbs|sprig|5f8f5a|3f7f4a|hb|warm|90|f|o|herb|Kekik (Thymus)|Thyme|Thym|زعتر|Timo Comune,Limone Fine|
oregano|herbs|sprig|4f8f4a|3f7f4a|hb|warm|90|f|o|herb|Kekik (Origanum)|Oregano|Origan|أوريغانو|Origano Greco,Izmir Fine|heritage
rosemary|herbs|sprig|4a6f4a|3a5f3a|hb|warm|120|f|o|herb|Biberiye|Rosemary|Romarin|إكليل الجبل|Rosmarino Alto,Mare Blu|
sage|herbs|basil|8fa88a|6f8a6a|hb|warm|100|f|o|herb|Adaçayı|Sage|Sauge|مريمية|Salvia Argento,Foglia Argentata|
lavender|herbs|spike|8a6ad0|5a7a5a|hb|warm|120|f|o|herb|Lavanta|Lavender|Lavande|لافندر|Lavanda Blu,Provenza Alta,Isparta Fine|
chamomile|herbs|daisy|f5f0e0|4a9a3a|hb|cool|65|f|o|herb|Papatya|Chamomile|Camomille|بابونج|Camomilla Dolce,Fiore Bianco|
cumin|herbs|sprig|a8a85a|6f8f3a|hb|cool|105|f|o|herb|Kimyon|Cumin|Cumin|كمون|Cumino Oro,Seme Aromatico|
anise|herbs|sprig|a8c06a|6f9f3a|hb|warm|120|f|o|herb|Anason|Anise|Anis|يانسون|Anice Verde,Seme Dolce|
fennel|herbs|sprig|9fc05a|5a9a3a|hb|warm|100|f|o|herb|Rezene|Fennel|Fenouil|شمر|Finocchio Bulbo,Dolce Piuma|
fenugreek|herbs|clover|7aa84a|4a9a3a|hb|cool|80|f|o|herb|Çemen otu|Fenugreek|Fenugrec|حلبة|Fieno Greco,Seme Giallo|
nigella|herbs|blossom5|8ab0e0|4a9a3a|hb|cool|110|f|o|herb|Çörek otu|Nigella|Nigelle|حبة البركة|Nigella Nera,Fiore Celeste|
chives|herbs|grass|4f9a4a|3a8a3a|hb|cool|75|fg|o|herb|Frenk soğanı|Chives|Ciboulette|ثوم معمر (شيفز)|Erba Cipollina,Fiore Viola|
lemonbalm|herbs|basil|7fbf5a|4a9a3a|hb|warm|80|f|o|herb|Oğul otu (melisa)|Lemon balm|Mélisse|ترنجان (بلسم الليمون)|Melissa Limone,Foglia Fresca|
marjoram|herbs|sprig|7fa85a|4a8a3a|hb|warm|85|f|o|herb|Mercanköşk|Marjoram|Marjolaine|بردقوش|Maggiorana Dolce,Mercanköşk Fine|
stevia|herbs|basil|6fae4a|4a9a3a|hb|warm|110|fg|o|herb|Stevia|Stevia|Stévia|ستيفيا|Stevia Dolce,Foglia Zucchero|sugar
marigold|flowers|marigold|f08a1c|3f8f3a|fl|warm|60|fg|o|flow|Kadife çiçeği|Marigold|Œillet d'Inde|قطيفة|Arancio Pieno,Fiamma Gialla,Nano Oro|
zinnia|flowers|zinnia|e0457b|3f8f3a|fl|warm|65|fg|o|flow|Zinya|Zinnia|Zinnia|زينيا|Zinnia Mix,Rosa Nana,Gigante Rossa|
petunia|flowers|trumpet|d84a9a|3f8f3a|fl|warm|90|fg|h|flow|Petunya|Petunia|Pétunia|بتونيا|Petunia Viola,Cascata Rosa,Stella Bianca|
cosmos|flowers|daisy|e870a8|3f8f3a|fl|warm|70|f|o|flow|Kozmos|Cosmos|Cosmos|كوزموس|Cosmea Rosa,Sonata Bianca|
pansy|flowers|blossom5|7a4ab0|3f8f3a|fl|cool|100|fg|o|flow|Hercai menekşe|Pansy|Pensée|بانسيه|Viola Tricolore,Faccia Gialla|
snapdragon|flowers|spike|e85a3a|3f8f3a|fl|cool|90|fg|o|flow|Aslanağzı|Snapdragon|Muflier|فم السبع|Bocca Leone,Torre Rosa|
sweetpea|flowers|spike|e898b8|3f8f3a|fl|cool|85|f|o|flow|Kokulu bezelye|Sweet pea|Pois de senteur|بازلاء الزهور|Pisello Odoroso,Spencer Mix|
aster|flowers|daisy|8a5ad0|3f8f3a|fl|warm|100|f|o|flow|Aster (yıldız çiçeği)|Aster|Aster|أستر|Aster Cinese,Stella Viola|
calendula|flowers|marigold|f2902a|3f8f3a|fl|cool|60|f|o|flow|Aynısafa|Calendula|Souci officinal|آذريون|Calendula Oro,Fiamma Piena|
cornflower|flowers|daisy|4a7ad0|3f8f3a|fl|cool|70|f|o|flow|Peygamber çiçeği|Cornflower|Bleuet|قنطريون|Fiordaliso Blu,Azzurro Alto|
nasturtium|flowers|trumpet|f2802a|3f8f3a|fl|warm|55|f|o|flow|Latin çiçeği|Nasturtium|Capucine|أبو خنجر|Nasturzio Fuoco,Foglia Scudo|
verbena|flowers|spike|9a4ad0|3f8f3a|fl|warm|100|fg|o|flow|Mine çiçeği|Verbena|Verveine|فيربينا|Verbena Viola,Cascata Lilla|
salvia|flowers|spike|d0302a|3f8f3a|fl|warm|90|fg|o|flow|Ateş çiçeği|Salvia|Sauge ornementale|ميرمية الزينة|Salvia Scarlatta,Fuoco Nano|
dianthus|flowers|zinnia|d8407a|3f8f3a|fl|cool|90|fg|o|flow|Karanfil|Dianthus|Œillet|قرنفل|Garofano Rosa,Perla Doppia|
celosia|flowers|spike|d8302a|3f8f3a|fl|warm|80|f|o|flow|Horozibiği|Celosia|Célosie|عرف الديك|Celosia Fiamma,Piuma Rossa|
hollyhock|flowers|spike|e8a0c0|3f8f3a|fl|cool|130|f|o|flow|Gülhatmi|Hollyhock|Rose trémière|خطمي|Malvone Rosa,Torre Antica|
morningglory|flowers|trumpet|5a5ad8|3f8f3a|fl|warm|70|f|o|flow|Gündüz sefası|Morning glory|Ipomée|مجد الصباح|Ipomea Celeste,Alba Blu|
gypsophila|flowers|daisy|f8f8f8|3f8f3a|fl|warm|70|f|o|flow|Cipso (çocuk nefesi)|Baby's breath|Gypsophile|جبسوفيلا|Nuvola Bianca,Velo Sposa|
`;
