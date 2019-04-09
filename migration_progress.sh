function count_to_migrate() { grep -Ril --include \*.coffee "angular.module" ./src/app | sed 's/^/- [ ] /'; }
function count_migrated() { grep -Ril --include \*.ts "@Component" ./src/app | sed 's/^/- [x] /';}
function print_progress() { echo $1 / $2 components migrated; }

echo "\nSUMMARY:\n"
print_progress `count_migrated | wc -l` `count_to_migrate | wc -l`

echo "\nMIGRATED:\n"
count_migrated

echo "\nTODO:\n"
count_to_migrate
