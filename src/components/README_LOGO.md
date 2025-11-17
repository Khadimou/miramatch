# 🎨 LogoIcon Component

Composant réutilisable pour afficher l'icône du logo MIRA MATCH de manière cohérente dans toute l'application.

## Utilisation

```tsx
import { LogoIcon } from '../components/LogoIcon';

// Utilisation basique
<LogoIcon />

// Avec taille personnalisée
<LogoIcon size={120} />

// Avec variante différente
<LogoIcon size={80} variant="gradient" />
```

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `size` | `number` | `60` | Taille de l'icône en pixels |
| `variant` | `'default' \| 'gradient' \| 'outlined' \| 'minimal'` | `'default'` | Style de l'icône |
| `style` | `ViewStyle` | `undefined` | Styles additionnels |

## Variantes

### `default` (Recommandé)
- Cercle blanc avec ombre
- Icône en forme de "M" avec dégradés
- Spark doré en haut à droite
- Parfait pour : écrans de login, profil

```tsx
<LogoIcon size={120} variant="default" />
```

### `gradient`
- Fond avec dégradé primaire (rose → violet → bleu)
- Icône "M" blanche
- Parfait pour : splash screen, headers

```tsx
<LogoIcon size={140} variant="gradient" />
```

### `outlined`
- Bordure rose, fond transparent
- Icône "M" rose
- Parfait pour : boutons, icônes dans le texte

```tsx
<LogoIcon size={40} variant="outlined" />
```

### `minimal`
- Pas de cercle, juste le "M"
- Couleurs primaire et secondaire
- Parfait pour : favicon, petites tailles

```tsx
<LogoIcon size={24} variant="minimal" />
```

## Exemples d'utilisation

### Dans un header
```tsx
<View style={styles.header}>
  <LogoIcon size={40} variant="minimal" />
  <Text style={styles.title}>MIRA MATCH</Text>
</View>
```

### Dans un bouton
```tsx
<TouchableOpacity style={styles.button}>
  <LogoIcon size={30} variant="outlined" />
  <Text>Retour</Text>
</TouchableOpacity>
```

### Avec animation
```tsx
<Animated.View style={{ opacity: fadeAnim }}>
  <LogoIcon size={100} variant="gradient" />
</Animated.View>
```

## Design

L'icône représente un "M" stylisé avec :
- 3 barres verticales (gauche, milieu, droite)
- La barre du milieu est plus courte (60% de hauteur)
- Dégradés de couleurs selon la variante
- Un spark doré pour la variante `default`

## Notes

- Le composant est entièrement vectoriel (pas d'images)
- Responsive : s'adapte à n'importe quelle taille
- Performance : utilise des gradients natifs
- Accessibilité : peut être personnalisé avec des styles
