/**
 * Photo Configuration for Arthur Stainmesse Photography Portfolio
 * Contains metadata for all portfolio images including tags and descriptions
 */

const PHOTO_CONFIG = [
    {
        id: 1,
        src: 'images/annecy-couple-and-fishermen.jpg',
        alt: 'Couple and fishermen by the lake in Annecy',
        tags: ['landscape', 'nature', 'water', 'people', 'clouds', 'france']
    },
    {
        id: 2,
        src: 'images/artificial-northern-lights.jpg',
        alt: 'Artificial northern lights display',
        tags: ['night', 'lights', 'ireland', 'artificial', 'urban']
    },
    {
        id: 3,
        src: 'images/ballycarbery-ruins.jpg',
        alt: 'Ancient ruins of Ballycarbery Castle',
        tags: ['landscape', 'ruins', 'history', 'architecture', 'ireland']
    },
    {
        id: 4,
        src: 'images/bád-eddie.jpg',
        alt: 'Bád Eddie - Traditional Irish boat',
        tags: ['boat', 'traditional', 'ireland', 'water', 'culture']
    },
    {
        id: 5,
        src: 'images/chilling-shrine.jpg',
        alt: 'Peaceful shrine in natural setting',
        tags: ['ireland', 'spiritual', 'nature', 'peaceful', 'architecture']
    },
    {
        id: 6,
        src: 'images/competing-signs.jpg',
        alt: 'Multiple competing street signs',
        tags: ['urban', 'signs', 'street', 'city', 'humor', 'hong-kong']
    },
    {
        id: 7,
        src: 'images/crow-dropping-from-radio-tower.jpg',
        alt: 'Crow dropping from radio tower',
        tags: ['wildlife', 'bird', 'tower', 'action', 'nature', 'ireland', 'animal']
    },
    {
        id: 8,
        src: 'images/floating-quaintness.jpg',
        alt: 'Quaint floating structure on water',
        tags: ['water', 'architecture', 'floating', 'peaceful', 'nature', 'china']
    },
    {
        id: 9,
        src: 'images/frog-striking-a-pose.jpg',
        alt: 'Frog striking a pose in natural habitat',
        tags: ['wildlife', 'frog', 'nature', 'macro', 'animal', 'ireland']
    }
];

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PHOTO_CONFIG;
} else if (typeof window !== 'undefined') {
    window.PHOTO_CONFIG = PHOTO_CONFIG;
}
