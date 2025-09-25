#!/usr/bin/env python3

"""
Ball Sort Puzzle Level Converter
Converts your distribution_*.json files to proper game levels
Since all balls are the same color, this is more like a liquid pouring puzzle
"""

import json
import os
import glob
import re
from typing import List, Dict, Any

class BallSortConverter:
    def __init__(self):
        # Since all balls are same color, we'll use a single color
        self.ball_color = "blue"
    
    def convert_puzzle(self, puzzle_data: Dict[str, Any], level_id: int, original_number: int) -> Dict[str, Any]:
        """Convert puzzle data to game format"""
        puzzle = puzzle_data["puzzle"]
        initial_state = puzzle["initialState"]
        bottle_capacities = puzzle["bottleCapacities"]
        desired_level = puzzle["desiredLevel"]
        moves_to_solve = puzzle["movesToSolve"]
        
        # Create tubes based on initial state
        tubes = []
        for i, ball_count in enumerate(initial_state):
            capacity = bottle_capacities[i]
            
            # Create balls array - all same color since that's your format
            balls = [self.ball_color] * ball_count
            
            tubes.append({
                "id": i,
                "balls": balls,
                "capacity": capacity
            })
        
        # Since all balls are the same color, we only have one color
        colors = [self.ball_color] if any(initial_state) else []
        
        return {
            "levelId": level_id,
            "name": f"Level {level_id} - Puzzle {original_number}",
            "difficulty": self.get_difficulty(moves_to_solve, len(tubes), sum(initial_state)),
            "tubes": tubes,
            "colors": colors,
            "moves": 0,
            "minMoves": moves_to_solve,
            "stars": {
                "1": max(moves_to_solve * 3, moves_to_solve + 10),
                "2": max(moves_to_solve * 2, moves_to_solve + 5),
                "3": moves_to_solve
            },
            "originalFile": f"distribution_23555_4_{original_number}_solution.json",
            "puzzleType": "liquid_pouring",  # Different from color sorting
            "desiredLevel": desired_level,
            "solutionSteps": puzzle.get("solutionSteps", [])
        }
    
    def get_difficulty(self, moves: int, tube_count: int, total_balls: int) -> str:
        """Determine difficulty based on various factors"""
        # Factor in moves, tubes, and balls for complexity
        complexity_score = moves + (tube_count * 0.5) + (total_balls * 0.1)
        
        if complexity_score <= 6:
            return "easy"
        elif complexity_score <= 12:
            return "medium"
        else:
            return "hard"
    
    def extract_puzzle_number(self, filename: str) -> int:
        """Extract puzzle number from filename"""
        match = re.search(r'distribution_23555_4_(\d+)_solution\.json', filename)
        return int(match.group(1)) if match else 0

def convert_all_levels():
    """Convert all distribution files to game levels"""
    converter = BallSortConverter()
    levels_dir = "./levels"
    
    # Get all distribution files
    pattern = os.path.join(levels_dir, "distribution_23555_4_*_solution.json")
    files = sorted(glob.glob(pattern), key=lambda x: converter.extract_puzzle_number(os.path.basename(x)))
    
    print(f"Found {len(files)} puzzle files to convert")
    
    converted_levels = []
    level_index = {
        "version": "1.0.0",
        "totalLevels": len(files),
        "levels": [],
        "difficulties": {
            "easy": {"name": "Easy", "color": "#4CAF50", "levels": []},
            "medium": {"name": "Medium", "color": "#FF9800", "levels": []},
            "hard": {"name": "Hard", "color": "#F44336", "levels": []}
        },
        "puzzleType": "liquid_pouring",
        "description": "Liquid pouring puzzle - move balls between tubes with different capacities"
    }
    
    # Convert each file
    for i, file_path in enumerate(files):
        filename = os.path.basename(file_path)
        puzzle_number = converter.extract_puzzle_number(filename)
        level_id = i + 1
        
        try:
            print(f"Converting {filename} -> level-{level_id:03d}.json")
            
            # Read original file
            with open(file_path, 'r') as f:
                puzzle_data = json.load(f)
            
            # Convert to game format
            game_level = converter.convert_puzzle(puzzle_data, level_id, puzzle_number)
            converted_levels.append(game_level)
            
            # Write converted level file
            output_filename = f"level-{level_id:03d}.json"
            output_path = os.path.join(levels_dir, output_filename)
            
            with open(output_path, 'w') as f:
                json.dump(game_level, f, indent=2)
            
            # Add to index
            level_index["levels"].append({
                "id": level_id,
                "file": output_filename,
                "name": game_level["name"],
                "difficulty": game_level["difficulty"],
                "unlocked": level_id == 1,  # Only first level unlocked
                "completed": False,
                "stars": 0,
                "bestMoves": None
            })
            
            # Add to difficulty category
            level_index["difficulties"][game_level["difficulty"]]["levels"].append(level_id)
            
        except Exception as e:
            print(f"Failed to convert {filename}: {str(e)}")
    
    # Write updated level index
    index_path = os.path.join(levels_dir, "levels-index.json")
    with open(index_path, 'w') as f:
        json.dump(level_index, f, indent=2)
    
    print(f"\n✅ Successfully converted {len(converted_levels)} levels!")
    print(f"📊 Difficulty distribution:")
    print(f"   Easy: {len(level_index['difficulties']['easy']['levels'])} levels")
    print(f"   Medium: {len(level_index['difficulties']['medium']['levels'])} levels")
    print(f"   Hard: {len(level_index['difficulties']['hard']['levels'])} levels")
    
    return converted_levels

if __name__ == "__main__":
    convert_all_levels()
    print("\n🎮 Level conversion complete!")
