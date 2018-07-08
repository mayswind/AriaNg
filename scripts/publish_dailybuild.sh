if [ $CI == "true" ] && [ $CIRCLE_BRANCH == "master" ]; then
  git config --global user.name "CircleCI";
  git config --global user.email "CircleCI";

  echo "Publishing daily build...";
  git clone https://github.com/mayswind/AriaNg-DailyBuild.git $HOME/AriaNg-DailyBuild/

  rm -rf $HOME/AriaNg-DailyBuild/*
  cp dist/* $HOME/AriaNg-DailyBuild/ -r;

  cd $HOME/AriaNg-DailyBuild/;

  git add -A;
  git commit -a -m "daily build #$CIRCLE_SHA1";
  git push origin master;

  echo "Done.";
fi
