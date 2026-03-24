
export function getRandomAvatar() {
  
  const avatar = [
    'https://res.cloudinary.com/dgh9uunif/image/upload/v1768719863/Wavy_Buddies_-_Avatar_2_rpcvtr.webp',
    'https://res.cloudinary.com/dgh9uunif/image/upload/v1768719858/Wavy_Buddies_-_Avatar_6_v4yog9.webp',
    'https://res.cloudinary.com/dgh9uunif/image/upload/v1768719861/Wavy_Buddies_-_Avatar_3_ez5gal.webp',
    'https://res.cloudinary.com/dgh9uunif/image/upload/v1768719861/Wavy_Buddies_-_Avatar_1_uvuceq.webp',
    'https://res.cloudinary.com/dgh9uunif/image/upload/v1768719860/Wavy_Buddies_-_Avatar_lwoxzq.webp',
    'https://res.cloudinary.com/dgh9uunif/image/upload/v1768719858/Wavy_Buddies_-_Avatar_5_gdbuhf.webp',
    'https://res.cloudinary.com/dgh9uunif/image/upload/v1768719858/Wavy_Buddies_-_Avatar_5_gdbuhf.webp',
    'https://res.cloudinary.com/dgh9uunif/image/upload/v1768719858/Wavy_Buddies_-_Avatar_4_zhwuou.webp'
  ];

  return avatar[Math.floor(Math.random() * avatar.length)]
}
