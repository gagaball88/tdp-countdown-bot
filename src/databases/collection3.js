//get file names: ls | sed 's/.*/"&",/'

const paths = [
"00-002.TGG2-flying-city.png",
"00-003.LO-hills.png",
"00-004.LO-welcome.png",
"00-008.TGG2-Os-Lumina-full.png",
"00-010.TGG2-Ploonaka-full.png",
"00-032.TGG2-plague.png",
"00-037.TGG2-moon-splash-4k.jpeg",
"00-038.TGG2-forest-splash-4k.jpeg",
"00-039.TGG2-mist-splash-4k.jpeg",
"00-040.TGG2-moon-splash-4k.jpeg",
"00-041.TGG2-forest-splash-4k.jpeg",
"01-001.LO-another-tale.png",
"03-001.LO-tree.png",
"03-002.LO-mountains.png",
"03-010.LO-books.png",
"04-001.LO-landscape.png",
"04-005.LO-landscape.png",
"BOOK_1_TheDragonPrince_NoeLeyva.jpg",
"BOOK_1_WelcomeToXadia_ShaunEllis.png",
"BOOK_1_WorldOfMagic_ShaunEllis.jpg",
"BOOK_2_ExampleOfPlay_DorothyYang.jpg",
"BOOK_2_WelcomeToCortex_RitaFei.jpg",
"BOOK_3_XadianCreatures_ShaunEllis.png",
"BOOK_4_ImprovingTraits_AmagoiaAgirre (1).jpg",
"BOOK_4_KeepingYourJournal_AmagoiaAgirre.jpg",
"BOOK_5_DarkMagic_NoeLeyva.jpg",
"BOOK_5_MagesGuide_AmagoiaAgirre (1).jpg",
"BOOK_5_MagicalItems_NoeLeyva.jpg",
"BOOK_6_Catalysts_AmagoiaAgirre.jpg",
"BOOK_6_TheTaleUnfolding_DorothyYang.jpg",
"BOOK_7_TaleOfTheCorruptedCore_ShaunEllis.jpg",
"BOOK_7_VialOfHope_NoeLeyva.jpg",
]


export default function randomPicture() {
    let randomNumber = Math.floor(Math.random() * paths.length);
    return paths[randomNumber];
}
