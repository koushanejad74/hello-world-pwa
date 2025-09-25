# Ball Sort Puzzle - Levels

This folder contains all the level definitions for the Ball Sort Puzzle game.

## 📁 File Structure

```
levels/
├── levels-index.json    # Master index of all levels
├── level-001.json      # Individual level files
├── level-002.json
└── ...
```

## 📝 Level JSON Format

Each level file should follow this format:

```json
{
  "levelId": 1,
  "name": "Level 1 - Easy Start",
  "difficulty": "easy",
  "tubes": [
    {
      "id": 0,
      "balls": ["red", "blue", "red", "blue"],
      "capacity": 4
    },
    {
      "id": 1,
      "balls": [],
      "capacity": 4
    }
  ],
  "colors": ["red", "blue", "green", "yellow"],
  "moves": 0,
  "minMoves": 8,
  "stars": {
    "1": 15,
    "2": 12,
    "3": 8
  }
}
```

### Field Descriptions:

- **`levelId`**: Unique identifier for the level (number)
- **`name`**: Display name for the level (string)
- **`difficulty`**: Difficulty category ("easy", "medium", "hard")
- **`tubes`**: Array of tube objects
  - **`id`**: Unique tube identifier (number)
  - **`balls`**: Array of color names from bottom to top (strings)
  - **`capacity`**: Maximum number of balls this tube can hold (number)
- **`colors`**: Array of all colors used in this level (strings)
- **`moves`**: Current move count (always 0 for new levels)
- **`minMoves`**: Optimal number of moves to solve (number)
- **`stars`**: Object defining move thresholds for star ratings
  - **`"1"`**: Moves needed for 1 star (number)
  - **`"2"`**: Moves needed for 2 stars (number)
  - **`"3"`**: Moves needed for 3 stars (number)

## 🎨 Supported Colors

The game supports these colors by default:
- `red`
- `blue` 
- `green`
- `yellow`
- `purple`
- `orange`
- `pink`
- `brown`
- `gray`
- `cyan`
- `lime`
- `indigo`

## ➕ Adding New Levels

1. **Create Level File**: Create a new JSON file named `level-XXX.json` (where XXX is zero-padded number)
2. **Follow Format**: Use the JSON format described above
3. **Update Index**: Add the level to `levels-index.json`
4. **Test**: Ensure the level is solvable and balanced

### Example of adding Level 3:

1. Create `level-003.json` with your level data
2. Update `levels-index.json`:
   ```json
   {
     "totalLevels": 3,
     "levels": [
       // ... existing levels ...
       {
         "id": 3,
         "file": "level-003.json",
         "name": "Level 3 - Your Level Name",
         "difficulty": "medium",
         "unlocked": false,
         "completed": false,
         "stars": 0,
         "bestMoves": null
       }
     ]
   }
   ```

## 🎯 Level Design Tips

1. **Start Simple**: Early levels should introduce mechanics gradually
2. **Empty Tubes**: Always provide at least 2 empty tubes for maneuverability
3. **Color Balance**: Ensure each color appears exactly 4 times (or tube capacity)
4. **Solvability**: Test that your level can be solved
5. **Difficulty Progression**: Gradually increase complexity
6. **Star Ratings**: Set reasonable move targets for different skill levels

## 🔄 How to Replace/Add Your Levels

If you have your own JSON level files:

1. **Backup**: Keep copies of your original files
2. **Convert**: Ensure they match the format above
3. **Replace**: Replace the sample files in this folder
4. **Update Index**: Modify `levels-index.json` to reflect your levels
5. **Test**: Load the game and verify levels work correctly

The level manager will automatically load and validate your levels when the game starts.
