/**
 * Photo Configuration for Arthur Stainmesse Photography Portfolio
 * Contains metadata for all portfolio images including tags and descriptions
 */

const PHOTO_CONFIG = [
    {
        id: 1,
        src: 'images/annecy-couple-and-fishermen.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['landscape', 'nature', 'water', 'people', 'clouds', 'france']
    },
    {
        id: 2,
        src: 'images/artificial-northern-lights.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['night', 'lights', 'ireland', 'artificial', 'urban']
    },
    {
        id: 3,
        src: 'images/ballycarbery-ruins.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['landscape', 'ruins', 'history', 'architecture', 'ireland']
    },
    {
        id: 4,
        src: 'images/bád-eddie.jpg',
        alt: 'Photography by Arthur Stainmesse',    
        tags: ['boat', 'traditional', 'ireland', 'water', 'culture']
    },
    {
        id: 5,
        src: 'images/chilling-shrine.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['ireland', 'spiritual', 'nature', 'eery', 'architecture']
    },
    {
        id: 6,
        src: 'images/competing-signs.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['urban', 'signs', 'street', 'city']
    },
    {
        id: 7,
        src: 'images/crow-dropping-from-radio-tower.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['bird', 'nature', 'ireland', 'animal', 'architecture']
    },
    {
        id: 8,
        src: 'images/floating-quaintness.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['water', 'architecture', 'floating', 'peaceful', 'nature', 'boat']
    },
    {
        id: 9,
        src: 'images/frog-striking-a-pose.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['frog', 'nature', 'macro', 'animal', 'ireland']
    },
    {
        id: 10,
        src: 'images/blue-hour-of-killarney.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['landscape', 'blue-hour', 'twilight', 'killarney', 'ireland', 'nature']
    },
    {
        id: 11,
        src: 'images/imperial-palace.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['architecture', 'building', 'history', 'water', 'boat']
    },
    {
        id: 12,
        src: 'images/kenmare-pier.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['landscape', 'water', 'ireland', 'nature', 'signs']
    },
    {
        id: 13,
        src: 'images/late-summer-in-prague.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['urban', 'summer', 'city', 'vehicle']
    },
    {
        id: 14,
        src: 'images/late-summer-lights.JPG',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['urban', 'summer', 'lights', 'peaceful']
    },
    {
        id: 15,
        src: 'images/lovely-sky-on-bricks.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['architecture', 'sky', 'bricks', 'building', 'urban', 'clouds']
    },
    {
        id: 16,
        src: 'images/mobile-police-station.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['urban', 'vehicle', 'street', 'city']
    },
    {
        id: 17,
        src: 'images/glenveagh-castle-tower.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['architecture', 'vehicle', 'street', 'city']
    },
    {
        id: 18,
        src: 'images/ominous-dublin-evening.jpg',
        alt: 'Photography by Arthur Stainmesse',
        tags: ['architecture', 'street', 'city', 'ireland']
    }
];

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PHOTO_CONFIG;
} else if (typeof window !== 'undefined') {
    window.PHOTO_CONFIG = PHOTO_CONFIG;
}
