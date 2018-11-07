function count_to_migrate() { grep -Ril --include \*.coffee "angular.module" ./src/app; }
function count_migrated() { grep -Ril --include \*.ts "@Component" ./src/app; }
function print_progress() { echo $1 / $2 components migrated; }

echo "\nTODO:\n"
count_to_migrate

echo "\nMIGRATED:\n"
count_migrated

echo "\nSUMMARY:\n"
print_progress `count_migrated | wc -l` `count_to_migrate | wc -l`
